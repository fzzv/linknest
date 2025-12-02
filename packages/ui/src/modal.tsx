'use client';

import { type ReactNode, useEffect } from 'react';
import { cn } from '@linknest/utils/lib';

export interface ModalProps {
  open: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  closable?: boolean;
  className?: string;
  contentClassName?: string;
  widthClassName?: string;
}

export const Modal = ({
  open,
  title,
  children,
  footer,
  onClose,
  closable = true,
  className,
  contentClassName,
  widthClassName = 'max-w-2xl',
}: ModalProps) => {
  useEffect(() => {
    if (!open || !closable) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closable, onClose]);

  if (!open) return null;

  return (
    <div className={cn('modal modal-open', className)}>
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'modal-box rounded-md border border-white/10 bg-[#0b111e] text-white shadow-2xl backdrop-blur',
          widthClassName,
          contentClassName,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {title ? <h3 className="text-xl font-semibold text-white">{title}</h3> : null}
          {closable ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-white/70"
              aria-label="Close modal"
              onClick={onClose}
            >
              ✕
            </button>
          ) : null}
        </div>

        <div className="mt-4">{children}</div>

        {footer ? <div className="modal-action mt-6">{footer}</div> : null}
      </div>

      <div
        className="modal-backdrop bg-black/60"
        aria-hidden="true"
        onClick={() => closable && onClose?.()}
      />
    </div>
  );
};

export default Modal;
