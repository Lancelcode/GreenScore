'use client';

import 'animate.css';
import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { EXPLANATIONS } from '@/lib/explanations';
import { MEASURES, type Evaluation } from '@/lib/scoring';
import { submitAssessment, type AssessmentState } from '@/server/actions/certificates';

const initial: AssessmentState = {};

const modalId = (measure: string) => `info${measure.replace(/[^A-Za-z0-9]/g, '')}`;

export function CalculatorForm() {
  const [state, action, pending] = useActionState(submitAssessment, initial);
  const [dismissed, setDismissed] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const result = state.result && state.result.id !== dismissed ? state.result : null;

  function close() {
    if (state.result) setDismissed(state.result.id);
    formRef.current?.reset();
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      {state.error && (
        <div className="alert alert-danger" role="alert">
          {state.error}
        </div>
      )}

      <form action={action} ref={formRef}>
        {MEASURES.map((measure, index) => (
          <div className="form-group mb-3" key={measure}>
            <div className="d-flex align-items-center">
              <label htmlFor={`measure_${index}`} className="form-label mb-1 fw-bold">
                {measure}
              </label>
              <button
                type="button"
                className="btn btn-link p-0 ms-2 mb-1 text-success"
                data-bs-toggle="modal"
                data-bs-target={`#${modalId(measure)}`}
                aria-label={`What is ${measure}?`}
              >
                <i className="fas fa-circle-info" aria-hidden="true" />
              </button>
            </div>
            <select className="form-select" name={`measure_${index}`} id={`measure_${index}`} required defaultValue="">
              <option value="">-- Select Level --</option>
              <option value="10">🟢 Green (Excellent)</option>
              <option value="5">🟠 Amber (Moderate)</option>
              <option value="0">🔴 Red (Not Implemented)</option>
            </select>
          </div>
        ))}

        <button type="submit" className="btn btn-success mt-3" disabled={pending}>
          Calculate My Score 🌍
        </button>
        <div className="mt-3">
          <Link href="/account" className="btn btn-outline-dark">
            👤 Back to My Profile
          </Link>
        </div>
      </form>

      {MEASURES.map((measure) => (
        <div className="modal fade" id={modalId(measure)} tabIndex={-1} aria-labelledby={`${modalId(measure)}Title`} key={measure}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title h5" id={`${modalId(measure)}Title`}>
                  {measure}
                </h2>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
              </div>
              <div className="modal-body" style={{ whiteSpace: 'pre-line' }}>
                {EXPLANATIONS[measure]}
              </div>
            </div>
          </div>
        </div>
      ))}

      {result && <ResultDialog result={result} onClose={close} />}
    </>
  );
}

function ResultDialog({ result, onClose }: { result: Evaluation & { id: number }; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move keyboard focus into the dialog when it opens…
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // …and let Escape close it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const bars = [
    { id: 'barGreen', label: '🟢 Green', value: result.green, className: 'bg-success' },
    { id: 'barAmber', label: '🟠 Amber', value: result.amber, className: 'bg-warning text-dark' },
    { id: 'barRed', label: '🔴 Red', value: result.red, className: 'bg-danger' },
  ];

  return (
    <>
      <div className="modal fade show d-block" id="resultModal" tabIndex={-1} aria-modal="true" role="dialog" aria-labelledby="resultTitle">
        <div className="modal-dialog modal-dialog-centered animate__animated animate__zoomIn">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5 animate__animated animate__rubberBand" id="resultTitle">
                {result.emoji} {result.award}
              </h2>
            </div>
            <div className="modal-body">
              <p>
                <strong>Your Score:</strong> {result.total} / 100
              </p>
              <p>{result.message}</p>

              {bars.map((bar) => (
                <div className="mb-3" key={bar.id}>
                  <p className="mb-1" id={bar.id}>
                    {bar.label}
                  </p>
                  <div className="progress" role="progressbar" aria-labelledby={bar.id} aria-valuenow={bar.value} aria-valuemin={0} aria-valuemax={10}>
                    <div className={`progress-bar ${bar.className}`} style={{ width: `${bar.value * 10}%` }}>
                      {bar.value}
                    </div>
                  </div>
                </div>
              ))}

              {result.shortfall > 0 ? (
                <p className="text-danger">
                  {result.emoji} <strong>{result.message}</strong>
                  <br />
                  You&apos;re <strong>{result.shortfall} points</strong> short. Consider donating{' '}
                  <strong>£{result.cost}</strong>.
                </p>
              ) : (
                <p className="text-success">✅ Perfect score! You&apos;re a green superstar!</p>
              )}
            </div>
            <div className="modal-footer d-flex flex-wrap justify-content-between gap-2">
              <Link href={`/certificates/${result.id}`} className="btn btn-outline-success">
                📄 Download Certificate
              </Link>
              {result.shortfall > 0 && (
                <Link href="/buy-points" className="btn btn-warning">
                  💸 Buy Points
                </Link>
              )}
              <Link href="/community" className="btn btn-outline-primary">
                🌱 Visit Community
              </Link>
              <Link href="/resources" className="btn btn-outline-dark">
                📚 Tips &amp; Guides
              </Link>
              <button type="button" className="btn btn-secondary" onClick={onClose} ref={closeRef}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
