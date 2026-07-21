import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Download, X, CheckCircle2, AlertTriangle,
  Building2, ReceiptText, List, ZoomIn, ZoomOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { invoiceApi } from '../api/client';

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
  const icons = {
    completed: <CheckCircle2 size={13} />,
    processing: null,
    failed: <AlertTriangle size={13} />,
  };
  return (
    <span className={`badge badge-${status}`} style={{ gap: 6 }}>
      {icons[status]}
      {status === 'completed' ? 'Extraction Complete'
        : status === 'failed' ? 'Extraction Failed'
        : 'Processing…'}
    </span>
  );
}

function findLineItems(extracted) {
  if (!extracted) return [];
  const keys = ['line_items', 'lineItems', 'items', 'rows', 'products', 'lines'];
  for (const k of keys) {
    if (Array.isArray(extracted[k]) && extracted[k].length) return extracted[k];
  }
  return [];
}

function findVendorInfo(extracted) {
  if (!extracted) return null;
  return (
    extracted.vendor_info ||
    extracted.vendorInfo ||
    extracted.vendor ||
    extracted.supplier ||
    extracted.seller ||
    null
  );
}

function findDocumentTotals(extracted) {
  if (!extracted) return null;
  return (
    extracted.document_totals ||
    extracted.documentTotals ||
    extracted.totals ||
    null
  );
}

function formatAmount(val, currency) {
  if (val == null) return '—';
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : (currency || '');
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return String(val);
  return `${sym}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderVendorBlock(vendorInfo) {
  if (!vendorInfo) return <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No vendor data extracted</span>;
  if (typeof vendorInfo === 'string') return <p>{vendorInfo}</p>;
  const fields = ['name', 'company', 'address', 'city', 'tax_id', 'taxId', 'vat', 'phone', 'email'];
  return (
    <div style={{ fontSize: 13, lineHeight: 1.8 }}>
      {fields
        .filter(f => vendorInfo[f])
        .map(f => <div key={f}>{vendorInfo[f]}</div>)
      }
      {/* Fallback: show all keys if none of the above match */}
      {!fields.some(f => vendorInfo[f]) &&
        Object.entries(vendorInfo).slice(0, 6).map(([k, v]) => (
          <div key={k}><strong>{k}:</strong> {String(v)}</div>
        ))
      }
    </div>
  );
}

function renderTotalsBlock(totals, invoice) {
  if (!totals) {
    // Fall back to top-level fields
    return (
      <div>
        <div className="total-label">Total Amount</div>
        <div className="total-highlight">
          {formatAmount(invoice.total_amount, invoice.currency)}
        </div>
      </div>
    );
  }

  if (typeof totals === 'object') {
    const totalVal = totals.total || totals.grand_total || totals.grandTotal || totals.total_amount || invoice.total_amount;
    const subtotal = totals.subtotal || totals.sub_total;
    const tax = totals.tax || totals.tax_amount || totals.vat;

    return (
      <div style={{ fontSize: 13, lineHeight: 2 }}>
        {subtotal != null && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{formatAmount(subtotal, invoice.currency)}</span></div>}
        {tax != null && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax</span><span>{formatAmount(tax, invoice.currency)}</span></div>}
        <div style={{ marginTop: 8 }}>
          <div className="total-label">Total Amount</div>
          <div className="total-highlight">{formatAmount(totalVal, invoice.currency)}</div>
        </div>
      </div>
    );
  }

  return <div className="total-highlight">{formatAmount(invoice.total_amount, invoice.currency)}</div>;
}

/* ------------------------------------------------------------------ */
/* Main Component                                                        */
/* ------------------------------------------------------------------ */

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table'); // 'table' | 'json'

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await invoiceApi.getById(id);
        setInvoice(data);
      } catch {
        toast.error('Invoice not found.');
        navigate('/recent');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="empty-state" style={{ height: '100vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid transparent', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        <p>Loading extraction…</p>
      </div>
    );
  }

  if (!invoice) return null;

  const lineItems = findLineItems(invoice.extracted);
  const vendorInfo = findVendorInfo(invoice.extracted);
  const totals = findDocumentTotals(invoice.extracted);
  const pdfUrl = invoiceApi.fileUrl(invoice.file_path);
  const isPdf = invoice.mime_type === 'application/pdf';

  // Determine line item columns
  const lineItemCols = lineItems.length > 0 ? Object.keys(lineItems[0]) : [];

  return (
    <div className="result-page">
      {/* Top Bar */}
      <div className="result-topbar">
        <div className="result-topbar-filename">
          <FileText size={16} style={{ flexShrink: 0 }} />
          <span title={invoice.original_name}>{invoice.original_name}</span>
        </div>

        <StatusBadge status={invoice.status} />

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/recent')}
          style={{ padding: '7px 12px' }}
        >
          <X size={15} />
          Close
        </button>

        <a
          href={invoiceApi.exportJsonUrl(id)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
          id="export-json-btn"
        >
          <Download size={15} />
          Export Data
        </a>

        <a
          href={invoiceApi.exportCsvUrl(id)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary"
          id="export-csv-btn"
        >
          <Download size={15} />
          Export CSV
        </a>
      </div>

      {/* Split Layout */}
      <div className="result-split">
        {/* Left: PDF Preview */}
        <div className="pdf-preview-panel">
          <div className="pdf-preview-toolbar">
            <span>Document Preview</span>
          </div>
          <div className="pdf-preview-body">
            {isPdf ? (
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                width="100%"
                style={{ height: 'calc(100vh - 120px)', border: 'none', borderRadius: 10 }}
                title="Invoice Preview"
              />
            ) : (
              <img
                src={pdfUrl}
                alt={invoice.original_name}
                style={{ maxWidth: '100%', borderRadius: 10, boxShadow: 'var(--shadow-md)' }}
              />
            )}
          </div>
        </div>

        {/* Right: Extracted Entities */}
        <div className="extraction-panel">
          <div className="extraction-panel-header">
            <h2>Extracted Entities</h2>
            <div className="view-toggle">
              <button
                className={`view-toggle-btn${view === 'table' ? ' active' : ''}`}
                onClick={() => setView('table')}
                id="view-table-btn"
              >
                Table View
              </button>
              <button
                className={`view-toggle-btn${view === 'json' ? ' active' : ''}`}
                onClick={() => setView('json')}
                id="view-json-btn"
              >
                JSON Code
              </button>
            </div>
          </div>

          <div className="extraction-panel-body">
            {invoice.status === 'failed' ? (
              <div className="empty-state">
                <AlertTriangle size={24} color="var(--error-text)" />
                <h3>Extraction Failed</h3>
                <p style={{ color: 'var(--error-text)', fontSize: 13 }}>{invoice.error_message}</p>
              </div>
            ) : view === 'json' ? (
              <pre className="json-view">
                {JSON.stringify(invoice.extracted, null, 2)}
              </pre>
            ) : (
              <>
                {/* Vendor + Totals row */}
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-card-header">
                      <Building2 size={13} />
                      Vendor Info
                    </div>
                    <div className="info-card-content">
                      {renderVendorBlock(vendorInfo)}
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-card-header">
                      <ReceiptText size={13} />
                      Document Totals
                    </div>
                    <div className="info-card-content">
                      {renderTotalsBlock(totals, invoice)}
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="line-items-header">
                  <h3>
                    <List size={13} />
                    Line Items
                  </h3>
                  {lineItems.length > 0 && (
                    <span className="row-count">{lineItems.length} rows extracted</span>
                  )}
                </div>

                {lineItems.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          {lineItemCols.map(col => (
                            <th key={col}>{col.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((row, i) => (
                          <tr key={i}>
                            {lineItemCols.map(col => (
                              <td key={col} className={typeof row[col] === 'number' ? 'amount' : ''}>
                                {row[col] != null ? String(row[col]) : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                    <List size={20} color="var(--text-tertiary)" />
                    <p style={{ fontSize: 13 }}>No line items detected. Switch to JSON view to see all extracted data.</p>
                  </div>
                )}

                {/* Raw fields that don't fit in above sections */}
                {invoice.extracted && (
                  <div style={{ marginTop: 'var(--space-lg)' }}>
                    <div className="line-items-header">
                      <h3>All Extracted Fields</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {Object.entries(invoice.extracted)
                        .filter(([k]) => !['line_items','lineItems','items','rows','products','lines','vendor_info','vendorInfo','vendor','supplier','document_totals','documentTotals','totals'].includes(k))
                        .map(([k, v]) => (
                          <div key={k} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            padding: '8px 0',
                            borderBottom: '1px solid var(--outline)',
                            fontSize: 13,
                            gap: 16,
                          }}>
                            <span style={{ color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                              {k.replace(/_/g, ' ')}
                            </span>
                            <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, textAlign: 'right' }}>
                              {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
