'use client';

import { useEffect, useRef } from 'react';
import { loadBootstrap } from './BootstrapClient';

interface FlashToastProps {
  flash: { id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string } | null;
}

const styles = {
  success: { bg: 'bg-success', icon: '✅' },
  error: { bg: 'bg-danger', icon: '❌' },
  warning: { bg: 'bg-warning', icon: '⚠️' },
  info: { bg: 'bg-primary', icon: 'ℹ️' },
} as const;

/** Shows a one-off message set by a server action, then forgets it. */
export function FlashToast({ flash }: FlashToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flash) return;
    // Delete the cookie so the message is shown only once.
    document.cookie = 'gs_flash=; Max-Age=0; path=/; SameSite=Strict';
    let cancelled = false;
    loadBootstrap().then((bs) => {
      if (!cancelled && toastRef.current) bs.Toast.getOrCreateInstance(toastRef.current).show();
    });
    return () => {
      cancelled = true;
    };
  }, [flash]);

  if (!flash) return <div className="toast-container position-fixed bottom-0 end-0 p-3" />;

  const { bg, icon } = styles[flash.type];
  const text = flash.type === 'warning' ? 'text-dark' : 'text-white';
  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      <div
        key={flash.id}
        ref={toastRef}
        className={`toast align-items-center ${text} ${bg} border-0 show`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-bs-autohide="true"
        data-bs-delay="4000"
      >
        <div className="d-flex">
          <div className="toast-body fw-semibold">
            {icon} {flash.message}
          </div>
          <button
            type="button"
            className={`btn-close ${flash.type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto`}
            data-bs-dismiss="toast"
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
}
