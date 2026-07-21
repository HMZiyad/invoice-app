import { useEffect, useRef, useState } from 'react';
import { FileText, Zap } from 'lucide-react';

const STAGES = [
  { label: 'Uploading file…',         pct: 10 },
  { label: 'Sending to n8n engine…',  pct: 25 },
  { label: 'Identifying document type…', pct: 40 },
  { label: 'Extracting header fields…', pct: 55 },
  { label: 'Identifying tabular data…', pct: 68 },
  { label: 'Parsing line items…',      pct: 78 },
  { label: 'Calculating totals…',      pct: 88 },
  { label: 'Finalising extraction…',   pct: 95 },
];

export default function ProcessingModal({ filename }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(STAGES[0].pct);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setStageIdx((prev) => {
        const next = Math.min(prev + 1, STAGES.length - 1);
        setProgress(STAGES[next].pct);
        return next;
      });
    }, 2200);

    return () => clearInterval(timerRef.current);
  }, []);

  const stage = STAGES[stageIdx];

  return (
    <div className="modal-backdrop">
      <div className="processing-modal">
        {/* Spinner */}
        <div className="processing-spinner-wrapper">
          <div className="processing-spinner-ring" />
          <div className="processing-spinner" />
        </div>

        <h2>Extracting Data</h2>
        <p className="processing-status">{stage.label}</p>

        {/* Progress */}
        <div>
          <div className="progress-label">
            <span>PROGRESS</span>
            <span>{stage.pct}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${stage.pct}%` }}
            />
          </div>
        </div>

        {/* Filename */}
        <div className="processing-filename">
          <FileText size={12} />
          {filename}
        </div>
      </div>
    </div>
  );
}
