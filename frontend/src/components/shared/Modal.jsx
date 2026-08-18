'use client';
import { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
  bodyClassName = 'p-6',
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      panelRef.current?.focus();
    } else {
      previouslyFocused.current?.focus?.();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] outline-none`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 id={titleId} className="font-semibold text-slate-800 text-base">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className={`overflow-y-auto flex-1 min-h-0 ${bodyClassName}`}>{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-white rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
