require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const pool = require('../db');

// ---------------------------------------------------------------------------
// Multer — store PDFs in backend/uploads/
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, PNG, and JPEG files are allowed'));
    }
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Try to extract a numeric total amount from whatever JSON n8n returns.
 * Checks common field names across languages.
 */
function extractTotalAmount(data) {
  if (!data || typeof data !== 'object') return null;

  // Unwrap array wrapper if n8n returns [{...}]
  const obj = Array.isArray(data) ? data[0] : data;
  if (!obj || typeof obj !== 'object') return null;

  const candidates = [
    obj.total_amount,
    obj.totalAmount,
    obj.total,
    obj.grand_total,
    obj.grandTotal,
    obj.amount_due,
    obj.amountDue,
    obj.invoice_total,
    obj.document_totals?.total,
    obj.totals?.total,
  ];

  for (const c of candidates) {
    const num = parseFloat(String(c || '').replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) return num;
  }
  return null;
}

function extractCurrency(data) {
  if (!data || typeof data !== 'object') return null;
  const obj = Array.isArray(data) ? data[0] : data;
  if (!obj) return null;
  return obj.currency || obj.Currency || null;
}

// ---------------------------------------------------------------------------
// POST /api/invoices/upload
// ---------------------------------------------------------------------------
router.post('/upload', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { filename, originalname, mimetype, size, path: filePath } = req.file;
  const relPath = `uploads/${filename}`;

  let invoiceId;

  try {
    // 1. Insert a "processing" row into the DB
    const insertResult = await pool.query(
      `INSERT INTO invoices
         (filename, original_name, file_path, mime_type, file_size, status)
       VALUES ($1, $2, $3, $4, $5, 'processing')
       RETURNING id`,
      [filename, originalname, relPath, mimetype, size]
    );
    invoiceId = insertResult.rows[0].id;

    // 2. Immediately return the invoice ID so the frontend can poll
    res.status(202).json({
      id: invoiceId,
      filename,
      originalName: originalname,
      status: 'processing',
    });

    // 3. Fire-and-forget: send the PDF to n8n and update DB when done
    (async () => {
      try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath), {
          filename: originalname,
          contentType: mimetype,
        });
        form.append('invoice_id', invoiceId);

        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        const n8nRes = await fetch(webhookUrl, {
          method: 'POST',
          body: form,
          headers: form.getHeaders(),
        });

        if (!n8nRes.ok) {
          const errText = await n8nRes.text();
          throw new Error(`n8n responded ${n8nRes.status}: ${errText}`);
        }

        const rawJson = await n8nRes.json();

        // n8n sometimes wraps in an array
        const extracted = Array.isArray(rawJson) ? rawJson[0] : rawJson;

        const totalAmount = extractTotalAmount(rawJson);
        const currency = extractCurrency(rawJson);

        await pool.query(
          `UPDATE invoices
           SET status = 'completed',
               extracted = $1,
               total_amount = $2,
               currency = $3,
               updated_at = NOW()
           WHERE id = $4`,
          [JSON.stringify(extracted), totalAmount, currency, invoiceId]
        );

        console.log(`✅ Invoice ${invoiceId} extracted successfully`);
      } catch (err) {
        console.error(`❌ Invoice ${invoiceId} extraction failed:`, err.message);
        await pool.query(
          `UPDATE invoices
           SET status = 'failed',
               error_message = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [err.message, invoiceId]
        ).catch(() => {});
      }
    })();
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/invoices — list all
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT id, original_name, filename, status, total_amount, currency, created_at, updated_at
      FROM invoices
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE original_name ILIKE $1`;
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/invoices/:id — single invoice
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM invoices WHERE id = $1',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/invoices/:id/export/json
// ---------------------------------------------------------------------------
router.get('/:id/export/json', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT original_name, extracted FROM invoices WHERE id = $1',
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    const { original_name, extracted } = rows[0];

    const safeName = (original_name || 'invoice').replace(/\.[^.]+$/, '');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(extracted, null, 2));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/invoices/:id/export/csv — convert line items to CSV
// ---------------------------------------------------------------------------
router.get('/:id/export/csv', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT original_name, extracted FROM invoices WHERE id = $1',
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });

    const { original_name, extracted } = rows[0];
    const safeName = (original_name || 'invoice').replace(/\.[^.]+$/, '');

    // Try to find line items array in the extracted JSON
    let lineItems = [];
    if (extracted) {
      const candidates = [
        extracted.line_items,
        extracted.lineItems,
        extracted.items,
        extracted.rows,
        extracted.products,
      ];
      for (const c of candidates) {
        if (Array.isArray(c) && c.length) { lineItems = c; break; }
      }
    }

    let csv = '';
    if (lineItems.length > 0) {
      const headers = Object.keys(lineItems[0]);
      csv = headers.join(',') + '\n';
      csv += lineItems.map(row =>
        headers.map(h => {
          const val = String(row[h] ?? '').replace(/"/g, '""');
          return `"${val}"`;
        }).join(',')
      ).join('\n');
    } else {
      // Fallback: flatten the whole extracted JSON into key-value CSV
      csv = 'field,value\n';
      const flatten = (obj, prefix = '') => {
        for (const [k, v] of Object.entries(obj || {})) {
          const key = prefix ? `${prefix}.${k}` : k;
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            flatten(v, key);
          } else {
            const val = String(v ?? '').replace(/"/g, '""');
            csv += `"${key}","${val}"\n`;
          }
        }
      };
      flatten(extracted);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/invoices/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT file_path FROM invoices WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });

    const filePath = path.join(__dirname, '../../', rows[0].file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
