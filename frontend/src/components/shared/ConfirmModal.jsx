'use client';
// components/shared/ConfirmModal.jsx
//
// Replaces window.confirm() everywhere. Native browser confirm dialogs can't
// be styled and look jarring against a custom design system — this matches
// the rest of the app and supports an in-flight loading state so the button
// can show a spinner instead of the UI just hanging.

import { Loader2, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex gap-3">
        {danger && (
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
        )}
        {description && <p className="text-sm text-slate-600 leading-relaxed">{description}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-5">
        <button onClick={onClose} disabled={loading} className="sb-btn-ghost">
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
            danger ? 'bg-red-500 hover:bg-red-600' : 'bg-accent-500 hover:bg-accent-600'
          }`}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}