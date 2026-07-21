# Luminous Extraction Suite

> AI-powered invoice PDF extractor — upload, extract, store, and export structured data.

Built with **React + Vite**, **Express.js**, **PostgreSQL**, and **n8n** automation.

---

## 🚀 Quick Start (Docker — Recommended)

```bash
# From the project root
docker compose up --build
```

Then open: **http://localhost:80**

That's it. Docker will:
1. Start PostgreSQL and run the schema automatically
2. Start the Express backend on port 4000
3. Build the React frontend and serve it via nginx on port 80

---

## 🏗️ Project Structure

```
invoice app/
├── docker-compose.yml       # Full stack orchestration
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.js         # Express server
│   │   ├── db.js            # PostgreSQL pool
│   │   ├── schema.sql       # DB schema (auto-runs in Docker)
│   │   └── routes/
│   │       └── invoices.js  # All invoice API endpoints
│   └── uploads/             # Stored PDFs (mounted as Docker volume)
└── frontend/
    ├── Dockerfile           # Multi-stage: Vite build → nginx serve
    ├── nginx.conf           # Proxies /api and /uploads to backend
    └── src/
        ├── api/client.js    # Axios API wrapper
        ├── components/
        │   ├── Sidebar.jsx
        │   └── ProcessingModal.jsx
        └── pages/
            ├── UploadPage.jsx
            ├── RecentPage.jsx
            └── ResultPage.jsx
```

---

## 🔄 How It Works

1. **User uploads PDF** → drag-and-drop or file picker
2. **Backend stores the file** → saves to `uploads/` volume + inserts DB row with `status: processing`
3. **Backend sends PDF to n8n** → `POST` multipart/form-data to the webhook
4. **n8n processes and responds** → any JSON structure is accepted and stored
5. **Frontend polls** → checks `/api/invoices/:id` every 2s until `completed`
6. **Result page renders** → PDF preview (left) + extracted entities (right)
7. **Export** → JSON or CSV download

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/invoices/upload` | Upload PDF, trigger n8n, return `{id, status}` |
| `GET`  | `/api/invoices` | List all extractions (optional `?search=`) |
| `GET`  | `/api/invoices/:id` | Get single extraction with full JSON |
| `GET`  | `/api/invoices/:id/export/json` | Download extracted JSON |
| `GET`  | `/api/invoices/:id/export/csv` | Download line items as CSV |
| `DELETE` | `/api/invoices/:id` | Delete extraction + file |
| `GET`  | `/uploads/:filename` | Serve stored PDF file |

---

## ⚙️ Configuration

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://luminous:luminous_secret@db:5432/luminous_extraction
PORT=4000
N8N_WEBHOOK_URL=https://aiteamsta.app.n8n.cloud/webhook-test/rentmas-quotation
CORS_ORIGIN=http://localhost:80
```

### Docker Compose Services

| Service | Port | Notes |
|---------|------|-------|
| `db` | 5432 | PostgreSQL 16 |
| `backend` | 4000 | Express API |
| `frontend` | 80 | nginx + React |

---

## 🛠️ Local Development (without Docker)

```bash
# Prerequisites: Node 20+, PostgreSQL running locally

# Backend
cd backend
cp .env.example .env    # Edit DATABASE_URL with your credentials
psql -d your_db -f src/schema.sql
npm install
npm run dev             # Starts on :4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev             # Starts on :5173
```

---

## 📦 n8n Webhook

The n8n workflow receives the PDF as `multipart/form-data` with field `file`.
It returns a JSON object — the app intelligently detects:
- `vendor_info` / `vendor` / `supplier`
- `document_totals` / `totals`
- `line_items` / `lineItems` / `items`
- `total_amount` and `currency` (extracted for the table view)

Any structure is displayed in the JSON Code view as a fallback.
