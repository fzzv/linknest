'use client';

import { cn } from '@linknest/utils';
import Draggable from 'react-draggable';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, type ButtonProps } from './button';

export interface ModalProps {
  open: boolean;
  title?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode | null;
  onClose?: () => void;
  onCancel?: () => void | Promise<unknown>;
  onOk?: () => void | Promise<unknown>;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  confirmLoading?: boolean;
  showCancelButton?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  widthClassName?: string;
  style?: CSSProperties;
  draggable?: boolean; // 是否可拖拽
  dragHandleClassName?: string; // 拖拽类名
}

export interface ConfirmConfig
  extends Omit<ModalProps, 'open' | 'children' | 'content' | 'contentClassName'> {
  content?: ReactNode;
  afterClose?: () => void;
  contentClassName?: string;
}

type ModalFuncResult = {
  destroy: () => void;
  update: (config: Partial<ConfirmConfig>) => void;
};
type ModalStatic = {
  confirm: (config: ConfirmConfig) => ModalFuncResult;
  destroyAll: () => void;
};

const destroyFns: Array<() => void> = [];

/**
 * 判断是否为 Promise 对象
 * @param value - 需要判断的值
 * @returns 是否为 Promise 对象
 */
const isPromiseLike = (value: unknown): value is Promise<unknown> =>
  Boolean(value) && typeof (value as Promise<unknown>).then === 'function';

function ModalComponentImpl({
  open,
  title,
  icon,
  children,
  content,
  footer,
  onClose,
  onCancel,
  onOk,
  okText = 'OK',
  cancelText = 'Cancel',
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  showCancelButton = true,
  closable = true,
  maskClosable = true,
  keyboard = true,
  centered = true,
  className,
  contentClassName,
  bodyClassName,
  widthClassName = 'max-w-2xl',
  style,
  draggable = false,
  dragHandleClassName = 'ln-modal-drag-handle',
}: ModalProps) {
  // 是否已挂载
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !keyboard) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel?.();
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, keyboard, onCancel, onClose]);

  const handleMaskClick = () => {
    if (!maskClosable) return;
    onCancel?.();
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  if (!open || !mounted) return null;

  const modalBox = (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      className={cn(
        'modal-box flex max-h-[90vh] w-full max-w-full flex-col gap-4 rounded-2xl shadow-2xl',
        'backdrop-blur-lg',
        widthClassName,
        contentClassName,
      )}
      style={style}
    >
      <div
        className={cn(
          'flex items-start justify-between gap-3 border-b border-base-content/50 pb-3',
          draggable && 'cursor-move select-none',
          draggable && dragHandleClassName,
        )}
      >
        <div className="flex flex-1 items-center gap-3">
          {icon ? <span className="text-xl">{icon}</span> : null}
          {title ? <h3 className="text-lg font-semibold text-base-content">{title}</h3> : null}
        </div>
        {closable ? (
          <Button
            variant="soft"
            size="icon"
            color="primary"
            type="button"
            aria-label="Close modal"
            onClick={handleCancel}
          >
            ✕
          </Button>
        ) : null}
      </div>

      <div className={cn('ln-modal-body flex-1 overflow-y-auto text-sm text-base-content px-2', bodyClassName)}>
        {children ?? content}
      </div>

      {footer !== null ? (
        <div className="ln-modal-footer mt-2 flex items-center justify-end gap-3">
          {footer ?? (
            <>
              {showCancelButton ? (
                <Button variant="outline" color="primary" onClick={handleCancel} {...cancelButtonProps}>
                  {cancelText}
                </Button>
              ) : null}
              <Button variant="custom" color="primary" onClick={onOk} isLoading={confirmLoading} {...okButtonProps}>
                {okText}
              </Button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );

  return mounted
    ? createPortal(
        <div
          className={cn(
            'modal modal-open',
            centered ? 'items-center' : 'items-start pt-10 sm:pt-16',
            className,
          )}
        >
          {draggable ? (
            <Draggable handle={`.${dragHandleClassName}`} nodeRef={modalRef}>
              {modalBox}
            </Draggable>
          ) : (
            modalBox
          )}

          <div className="modal-backdrop bg-black/60" aria-hidden="true" onClick={handleMaskClick} />
        </div>,
        document.body,
      )
    : null;
}

type ModalComponent = typeof ModalComponentImpl & ModalStatic;

const Modal = ModalComponentImpl as ModalComponent;

Modal.confirm = (config: ConfirmConfig): ModalFuncResult => {
  if (typeof document === 'undefined') {
    return {
      destroy: () => undefined,
      update: () => undefined,
    };
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  let latestConfig: ConfirmConfig = {
    maskClosable: false,
    closable: false,
    showCancelButton: true,
    ...config,
  };
  let loading = latestConfig.confirmLoading ?? false;
  let destroyed = false;

  const destroy = () => {
    destroyed = true;
    root.unmount();
    container.remove();
    const index = destroyFns.indexOf(destroy);
    if (index > -1) {
      destroyFns.splice(index, 1);
    }
    latestConfig.afterClose?.();
  };

  destroyFns.push(destroy);

  const close = () => destroy();

  const handleCancel = () => {
    const result = latestConfig.onCancel?.();
    if (isPromiseLike(result)) {
      void result.then((shouldClose) => {
        if (shouldClose === false) return;
        close();
      }).catch(() => close());
      return;
    }
    if (typeof result === 'boolean' && result === false) return;
    close();
  };

  const handleOk = async () => {
    let shouldClose = true;

    try {
      const result = latestConfig.onOk?.();

      if (isPromiseLike(result)) {
        loading = true;
        render(latestConfig);
        const resolved = await result;
        if (resolved === false) {
          shouldClose = false;
        }
      } else if (typeof result === 'boolean' && result === false) {
        shouldClose = false;
      }
    } catch (_error) {
      shouldClose = false;
    } finally {
      loading = false;
    }

    if (shouldClose) {
      close();
      return;
    }

    if (!destroyed) {
      render(latestConfig);
    }
  };

  const render = (nextConfig: ConfirmConfig) => {
    if (destroyed) return;
    latestConfig = nextConfig;

    root.render(
      <ModalComponentImpl
        {...nextConfig}
        open
        icon={nextConfig.icon}
        title={nextConfig.title}
        content={nextConfig.content}
        footer={nextConfig.footer}
        okText={nextConfig.okText}
        cancelText={nextConfig.cancelText}
        confirmLoading={nextConfig.confirmLoading ?? loading}
        className={nextConfig.className}
        contentClassName={nextConfig.contentClassName}
        widthClassName={nextConfig.widthClassName}
        draggable={nextConfig.draggable}
        dragHandleClassName={nextConfig.dragHandleClassName}
        closable={nextConfig.closable}
        centered={nextConfig.centered}
        maskClosable={nextConfig.maskClosable}
        keyboard={nextConfig.keyboard}
        showCancelButton={nextConfig.showCancelButton}
        onClose={handleCancel}
        onCancel={handleCancel}
        onOk={handleOk}
      />,
    );
  };

  render(latestConfig);

  return {
    destroy: close,
    update: (next) => {
      if (Object.prototype.hasOwnProperty.call(next, 'confirmLoading')) {
        loading = next.confirmLoading ?? false;
      }
      render({ ...latestConfig, ...next });
    },
  };
};

Modal.destroyAll = () => {
  destroyFns.splice(0).forEach((destroy) => destroy());
};

export { Modal };
export default Modal;
