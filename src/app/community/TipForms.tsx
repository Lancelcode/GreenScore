'use client';

import { useEffect, useRef, useState } from 'react';
import { loadBootstrap } from '@/components/BootstrapClient';
import { TIP_MAX_LENGTH, charLength } from '@/lib/validator';
import { editTip, postTip } from '@/server/actions/community';

function Counter({ id, length }: { id: string; length: number }) {
  const nearLimit = length >= TIP_MAX_LENGTH * 0.9;
  return (
    <small id={id} className={nearLimit ? 'text-danger' : 'text-muted'} aria-live="polite">
      {length} / {TIP_MAX_LENGTH}
    </small>
  );
}

/** The "Share a tip" form with a live character counter. */
export function TipComposer() {
  const [length, setLength] = useState(0);

  return (
    <form
      action={async (form) => {
        await postTip(form);
        setLength(0);
      }}
      aria-label="Post a new sustainability tip"
    >
      <label htmlFor="tipMessage" className="form-label fw-semibold">
        Share a tip:
      </label>
      <textarea
        name="message"
        id="tipMessage"
        rows={3}
        className="form-control"
        placeholder="E.g. I switched to bamboo toothbrushes!"
        maxLength={TIP_MAX_LENGTH}
        required
        aria-describedby="tipCounter"
        onInput={(e) => setLength(charLength(e.currentTarget.value))}
      />
      <div className="d-flex justify-content-between align-items-center mt-1 mb-2">
        <Counter id="tipCounter" length={length} />
        <small className="text-muted fst-italic">Keep it concise and helpful 🌱</small>
      </div>
      <button type="submit" className="btn btn-success">
        ✅ Post Tip
      </button>
    </form>
  );
}

/**
 * One shared "Edit Tip" dialog. Each tip's Edit button opens it through
 * Bootstrap's data attributes and carries the tip's id and text.
 */
export function EditTipDialog() {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState({ id: '', message: '' });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onShow = (event: Event) => {
      const button = (event as Event & { relatedTarget?: HTMLElement }).relatedTarget;
      setTip({ id: button?.dataset.id ?? '', message: button?.dataset.message ?? '' });
    };
    dialog.addEventListener('show.bs.modal', onShow);
    return () => dialog.removeEventListener('show.bs.modal', onShow);
  }, []);

  async function save(form: FormData) {
    await editTip(form);
    const bs = await loadBootstrap();
    if (dialogRef.current) bs.Modal.getOrCreateInstance(dialogRef.current).hide();
  }

  return (
    <div className="modal fade" id="editModal" tabIndex={-1} aria-labelledby="editModalTitle" ref={dialogRef}>
      <div className="modal-dialog">
        <form className="modal-content" action={save}>
          <div className="modal-header">
            <h2 className="modal-title h5" id="editModalTitle">
              Edit Tip
            </h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <div className="modal-body">
            <input type="hidden" name="tip_id" value={tip.id} />
            <label htmlFor="editTipMessage" className="form-label">
              Your tip
            </label>
            <textarea
              className="form-control"
              name="message"
              id="editTipMessage"
              rows={4}
              maxLength={TIP_MAX_LENGTH}
              required
              aria-describedby="editTipCounter"
              value={tip.message}
              onChange={(e) => setTip({ ...tip, message: e.target.value })}
            />
            <Counter id="editTipCounter" length={charLength(tip.message)} />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-success">
              💾 Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
