import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Zap, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { invoiceApi } from '../api/client';
import ProcessingModal from '../components/ProcessingModal';

const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg'];

export default function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  const handleFiles = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error('Only PDF, PNG, and JPEG files are supported.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File exceeds 50 MB limit.');
      return;
    }

    setCurrentFile(file);
    setProcessing(true);

    try {
      const { data } = await invoiceApi.upload(file);
      const invoiceId = data.id;

      // Poll until completed or failed
      const poll = async () => {
        const { data: inv } = await invoiceApi.getById(invoiceId);
        if (inv.status === 'completed') {
          setProcessing(false);
          navigate(`/extraction/${invoiceId}`);
        } else if (inv.status === 'failed') {
          setProcessing(false);
          toast.error(`Extraction failed: ${inv.error_message || 'Unknown error'}`);
        } else {
          setTimeout(poll, 2000);
        }
      };

      setTimeout(poll, 3000);
    } catch (err) {
      setProcessing(false);
      toast.error(err?.response?.data?.error || 'Upload failed. Please try again.');
    }
  }, [navigate]);

  // Drag handlers
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      {processing && <ProcessingModal filename={currentFile?.name || ''} />}

      <div className="upload-page">
        {/* Hero */}
        <div className="upload-hero">
          <h1>Extract Intel, Effortlessly.</h1>
          <p>
            Securely parse invoices, receipts, and complex PDFs into structured
            data in seconds. Designed for absolute precision.
          </p>
        </div>

        {/* Drop Zone */}
        <div className="dropzone-wrapper">
          <div
            className={`dropzone${dragging ? ' dragging' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            aria-label="Upload invoice file"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="dropzone-input"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="dropzone-icon">
              <Upload size={30} />
            </div>

            <h2>Drop invoices or PDFs here</h2>
            <p>or click to browse your files. Supports PDF, PNG, JPEG up to 50MB.</p>

            <button
              className="btn btn-primary"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              id="select-files-btn"
            >
              Select Files <ArrowRight size={16} />
            </button>
          </div>

          {/* n8n badge */}
          <div className="n8n-badge">
            <Zap size={13} />
            Powered by n8n
          </div>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-card-icon">
              <Upload size={20} />
            </div>
            <h3>1. Upload</h3>
            <p>
              Securely ingest raw documents via drag-and-drop. We support
              complex, multi-page PDFs in any language.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <FileText size={20} />
            </div>
            <h3>2. Extract</h3>
            <p>
              Our LLM-powered n8n engine intelligently identifies line items,
              totals, dates, and custom fields with high fidelity.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <ArrowRight size={20} />
            </div>
            <h3>3. Export</h3>
            <p>
              Download structured JSON/CSV instantly, or review extracted
              entities in our interactive data viewer.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="page-footer">
          <span>© 2024 Luminous Extraction. Powered by n8n.</span>
          <div className="page-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">API Docs</a>
          </div>
        </footer>
      </div>
    </>
  );
}
