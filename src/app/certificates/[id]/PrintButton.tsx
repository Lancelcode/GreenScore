'use client';

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-success btn-lg px-4">
      🖨️ Print / Save as PDF
    </button>
  );
}
