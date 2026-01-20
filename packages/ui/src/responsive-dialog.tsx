'use client';

import * as React from 'react';
import { cn } from '@linknest/utils';
import { Button, type ButtonProps } from './button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './drawer';
import { Modal } from './modal';

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}

export interface ResponsiveDialogProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode | null;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  onOk?: () => void | Promise<unknown>;
  onCancel?: () => void | Promise<unknown>;
  confirmLoading?: boolean;
  showCancelButton?: boolean;
  closable?: boolean;
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  widthClassName?: string;
  draggable?: boolean;
  dragHandleClassName?: string;
}

export function ResponsiveDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  okText = 'OK',
  cancelText = 'Cancel',
  okButtonProps,
  cancelButtonProps,
  onOk,
  onCancel,
  confirmLoading,
  showCancelButton = true,
  closable = true,
  className,
  contentClassName,
  bodyClassName,
  widthClassName = 'max-w-2xl',
  draggable = false,
  dragHandleClassName = 'ln-modal-drag-handle',
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  const handleClose = React.useCallback(() => {
    onCancel?.();
    onClose?.();
  }, [onCancel, onClose]);

  const defaultFooter = (
    <>
      {showCancelButton && (
        <Button variant="outline" color="primary" onClick={handleClose} {...cancelButtonProps}>
          {cancelText}
        </Button>
      )}
      <Button variant="custom" color="primary" onClick={onOk} isLoading={confirmLoading} {...okButtonProps}>
        {okText}
      </Button>
    </>
  );

  const footerContent = footer !== undefined ? footer : defaultFooter;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DrawerContent className={cn('max-h-[85vh]', contentClassName)}>
          <DrawerHeader className="text-left">
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className={cn('flex-1 overflow-y-auto px-4', bodyClassName)}>{children}</div>
          {footerContent !== null && (
            <DrawerFooter className="flex-row justify-end gap-3 pt-2">
              {footerContent}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      onCancel={onCancel}
      onOk={onOk}
      title={title}
      footer={footerContent}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={okButtonProps}
      cancelButtonProps={cancelButtonProps}
      confirmLoading={confirmLoading}
      showCancelButton={showCancelButton}
      closable={closable}
      className={className}
      contentClassName={contentClassName}
      bodyClassName={bodyClassName}
      widthClassName={widthClassName}
      draggable={draggable}
      dragHandleClassName={dragHandleClassName}
    >
      {children}
    </Modal>
  );
}

export default ResponsiveDialog;
