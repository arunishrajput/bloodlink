"use client";

import { useEffect, useRef } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl bg-card p-0 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm`}
    >
      {open && (
        <div className="relative max-h-[85vh] overflow-y-auto p-6">
          <button onClick={onClose} className="absolute top-3 right-3 rounded-lg p-2 text-muted hover:bg-paper" aria-label="Close">
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor"><path d="M5.3 4.3a1 1 0 0 0-1 1.4L8.6 10l-4.3 4.3a1 1 0 1 0 1.4 1.4L10 11.4l4.3 4.3a1 1 0 0 0 1.4-1.4L11.4 10l4.3-4.3a1 1 0 0 0-1.4-1.4L10 8.6 5.7 4.3a1 1 0 0 0-.4 0Z" /></svg>
          </button>
          {title && <h2 className="mb-4 pr-8 text-xl font-bold">{title}</h2>}
          {children}
        </div>
      )}
    </dialog>
  );
}
