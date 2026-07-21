import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Image, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { invoiceApi } from '../api/client';

function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function FileIcon({ mimetype }) {
  if (mimetype?.startsWith('image')) return <Image size={15} className="file-icon" />;
  return <FileText size={15} className="file-icon" />;
}

export default function RecentPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchInvoices = useCallback(async (q = '') => {
    try {
      const { data } = await invoiceApi.list(q);
      setInvoices(data);
    } catch {
      toast.error('Failed to load extractions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    // Refresh every 5 seconds to pick up processing->completed transitions
    const interval = setInterval(() => fetchInvoices(search), 5000);
    return () => clearInterval(interval);
  }, [fetchInvoices, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchInvoices(e.target.value);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this extraction permanently?')) return;
    setDeleting(id);
    try {
      await invoiceApi.delete(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast.success('Extraction deleted.');
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount, currency) => {
    if (amount == null) return '—';
    const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : (currency || '$');
    return `${sym}${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Recent Extractions</h1>
          <p>Review and manage your processed documents.</p>
        </div>

        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search filenames…"
            value={search}
            onChange={handleSearch}
            id="search-invoices"
          />
        </div>
      </div>

      <div style={{ padding: '0 var(--space-xl)', flex: 1, marginTop: 'var(--space-lg)' }}>
        {loading ? (
          <div className="empty-state">
            <div className="processing-spinner" style={{ width: 32, height: 32, border: '3px solid transparent', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <p>Loading extractions…</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={24} color="var(--text-tertiary)" />
            </div>
            <h3>{search ? 'No results found' : 'No extractions yet'}</h3>
            <p>{search ? 'Try a different search term.' : 'Upload an invoice to get started.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => inv.status === 'completed' && navigate(`/extraction/${inv.id}`)}
                  style={{ cursor: inv.status === 'completed' ? 'pointer' : 'default' }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileIcon mimetype={inv.mime_type} />
                      <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 13 }}>
                        {inv.original_name}
                      </span>
                    </div>
                  </td>
                  <td className="muted">{formatDate(inv.created_at)}</td>
                  <td className="amount">{formatAmount(inv.total_amount, inv.currency)}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '6px 8px', color: 'var(--error-text)' }}
                      onClick={(e) => handleDelete(e, inv.id)}
                      disabled={deleting === inv.id}
                      title="Delete extraction"
                      id={`delete-${inv.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer className="page-footer">
        <span>© 2024 Luminous Extraction. Powered by n8n.</span>
        <div className="page-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">API Docs</a>
        </div>
      </footer>
    </div>
  );
}
