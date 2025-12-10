'use client';

import { cn } from '@linknest/utils';
import { createPopper, type Instance, type Placement, type VirtualElement } from '@popperjs/core';
import {
  cloneElement,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactEventHandler,
  type ReactNode,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export type ContextMenuItem = {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
};

export interface ContextMenuProps {
  items: ContextMenuItem[];
  children: ReactElement<{
    onContextMenu?: ReactEventHandler;
    className?: string;
  }>;
  placement?: Placement;
  offset?: [number, number];
  className?: string;
  menuClassName?: string;
  closeOnSelect?: boolean;
}

export function ContextMenu({
  items,
  children,
  placement = 'bottom-start',
  offset = [0, 10],
  className,
  menuClassName,
  closeOnSelect = true,
}: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const popperInstance = useRef<Instance | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const virtualReference = useMemo<VirtualElement | null>(() => {
    if (!position) return null;
    return {
      getBoundingClientRect: () => {
        const { x, y } = position;
        return {
          width: 0,
          height: 0,
          top: y,
          bottom: y,
          left: x,
          right: x,
          x,
          y,
          toJSON: () => undefined,
        };
      },
    };
  }, [position]);

  useEffect(() => {
    if (!isOpen || !virtualReference || !menuRef.current) {
      popperInstance.current?.destroy();
      popperInstance.current = null;
      return;
    }

    popperInstance.current = createPopper(virtualReference, menuRef.current, {
      placement,
      strategy: 'fixed',
      modifiers: [
        { name: 'offset', options: { offset } },
        { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
        { name: 'flip', options: { padding: 8 } },
      ],
    });

    return () => {
      popperInstance.current?.destroy();
      popperInstance.current = null;
    };
  }, [isOpen, offset, placement, virtualReference]);

  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalClick = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScroll = () => setIsOpen(false);

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('contextmenu', handleGlobalClick);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('contextmenu', handleGlobalClick);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleContextMenu = useCallback((event: ReactMouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setIsOpen(true);
  }, []);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    if (closeOnSelect) {
      setIsOpen(false);
    }
    item.onSelect?.();
  };

  const trigger = useMemo(() => {
    if (!isValidElement(children)) {
      return (
        <div className={cn('relative', className)} onContextMenu={handleContextMenu}>
          {children}
        </div>
      );
    }

    return cloneElement(children, {
      className: cn('relative', className, children.props.className),
      onContextMenu: (event: ReactMouseEvent) => {
        children.props.onContextMenu?.(event);
        handleContextMenu(event);
      },
    });
  }, [children, className, handleContextMenu]);

  const menu = (
    <div
      ref={menuRef}
      className={cn(
        'z-1200 rounded-xl border border-primary/30 bg-base-100 text-base-content shadow-2xl backdrop-blur',
        'origin-top-left p-1',
        'max-h-[60vh] overflow-y-auto',
        menuClassName,
      )}
      role="menu"
      aria-label="Context menu"
    >
      <ul className="menu menu-sm gap-1 text-sm">
        {items.map((item) => (
          <li key={item.key} className="w-full">
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-base-300',
                item.danger && 'text-error hover:text-error',
                item.disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
              )}
              role="menuitem"
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
            >
              {item.icon ? <span className="text-base">{item.icon}</span> : null}
              <span className="flex-1">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      {trigger}
      {isOpen && mounted ? createPortal(menu, document.body) : null}
    </>
  );
}

export default ContextMenu;
