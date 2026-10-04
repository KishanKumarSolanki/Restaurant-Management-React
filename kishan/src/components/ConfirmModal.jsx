import { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ open, title = 'Confirm Deletion', children, confirmLabel = 'Delete', busy, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" onMouseDown={onCancel}>
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between bg-red-600 px-5 py-3 text-white">
          <h5 className="flex items-center gap-2 font-semibold"><AlertTriangle size={18} /> {title}</h5>
          <button onClick={onCancel} className="cursor-pointer" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="space-y-2 px-5 py-4 text-sm">
          {children}
          <p className="text-red-600">This action cannot be undone.</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm} disabled={busy}><Trash2 size={14} /> {busy ? 'Deleting...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
