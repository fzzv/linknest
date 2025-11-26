'use client';

import { cn } from '@linknest/utils/lib';
import { createPortal } from 'react-dom';
import {
  type JSX,
  type RefObject,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface MessageConfig {
  key?: string;
  type?: MessageType;
  content: ReactNode;
  duration?: number;
  closable?: boolean;
  className?: string;
  onClose?: () => void;
}

export interface MessageInstance {
  close: () => void;
}

export interface MessageApi {
  open: (config: MessageConfig) => MessageInstance;
  info: (content: ReactNode, duration?: number) => MessageInstance;
  success: (content: ReactNode, duration?: number) => MessageInstance;
  warning: (content: ReactNode, duration?: number) => MessageInstance;
  error: (content: ReactNode, duration?: number) => MessageInstance;
  loading: (content: ReactNode, duration?: number) => MessageInstance;
}

export interface UseMessageOptions {
  duration?: number;
  maxCount?: number;
  placement?: 'top' | 'bottom';
}

interface MessageProviderProps extends UseMessageOptions {
  apiRef: RefObject<MessageApi | null>;
}

interface MessageItem extends MessageConfig {
  key: string;
  type: MessageType;
  content: ReactNode;
}

const typeClassName: Record<MessageType, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
  loading: '',
};

const noopInstance: MessageInstance = { close: () => undefined };

const generateKey = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function MessageProvider({
  apiRef,
  duration = 3000,
  maxCount = 5,
  placement = 'top',
}: MessageProviderProps): JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  const clearTimer = useCallback((key: string) => {
    const timer = timers.current.get(key);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(key);
    }
  }, []);

  const remove = useCallback((key: string) => {
    clearTimer(key);
    setMessages((prev) => {
      const target = prev.find((message) => message.key === key);
      if (target?.onClose) {
        target.onClose();
      }

      return prev.filter((message) => message.key !== key);
    });
  }, [clearTimer]);

  const open = useCallback((config: MessageConfig): MessageInstance => {
    const key = config.key ?? generateKey();
    const message: MessageItem = {
      key,
      type: config.type ?? 'info',
      content: config.content,
      closable: config.closable ?? false,
      className: config.className,
      onClose: config.onClose,
      duration: config.duration,
    };

    setMessages((prev) => {
      const next = [...prev, message];

      if (maxCount && next.length > maxCount) {
        const overflow = next.length - maxCount;
        const discarded = next.slice(0, overflow);
        discarded.forEach((item) => {
          clearTimer(item.key);
          item.onClose?.();
        });

        return next.slice(overflow);
      }

      return next;
    });

    if (config.duration !== 0) {
      const timeout = window.setTimeout(() => remove(key), config.duration ?? duration);
      timers.current.set(key, timeout);
    }

    return { close: () => remove(key) };
  }, [clearTimer, duration, maxCount, remove]);

  const api = useMemo<MessageApi>(() => {
    const shortcut = (type: MessageType) => (content: ReactNode, customDuration?: number) =>
      open({ type, content, duration: customDuration });

    return {
      open,
      info: shortcut('info'),
      success: shortcut('success'),
      warning: shortcut('warning'),
      error: shortcut('error'),
      loading: shortcut('loading'),
    };
  }, [open]);

  useEffect(() => {
    apiRef.current = api;

    return () => {
      apiRef.current = null;
    };
  }, [api, apiRef]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed left-1/2 z-1100 flex w-full max-w-xl -translate-x-1/2 flex-col gap-3 px-4 sm:px-0',
        placement === 'bottom' ? 'bottom-6' : 'top-6',
      )}
    >
      {messages.map((message) => (
        <div key={message.key} className="pointer-events-auto">
          <div className={cn('alert shadow-lg text-sm', typeClassName[message.type], message.className)}>
            <div className="flex items-center gap-3">
              {message.type === 'loading' ? (
                <span className="loading loading-spinner loading-sm" aria-hidden="true" />
              ) : null}
              <span>{message.content}</span>
            </div>
            {message.closable ? (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                aria-label="Close notification"
                onClick={() => remove(message.key)}
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>,
    document.body,
  );
}

export function useMessage(options?: UseMessageOptions): [MessageApi, JSX.Element] {
  const apiRef = useRef<MessageApi | null>(null);
  const { duration, maxCount, placement } = options ?? {};

  const holder = useMemo(
    () => (
      <MessageProvider
        apiRef={apiRef}
        duration={duration}
        maxCount={maxCount}
        placement={placement}
      />
    ),
    [duration, maxCount, placement],
  );

  const openProxy = useCallback(
    (config: MessageConfig) => apiRef.current?.open(config) ?? noopInstance,
    [],
  );

  const shortcut = useCallback(
    (type: MessageType) => (content: ReactNode, customDuration?: number) =>
      openProxy({ type, content, duration: customDuration }),
    [openProxy],
  );

  const api = useMemo<MessageApi>(
    () => ({
      open: openProxy,
      info: shortcut('info'),
      success: shortcut('success'),
      warning: shortcut('warning'),
      error: shortcut('error'),
      loading: shortcut('loading'),
    }),
    [openProxy, shortcut],
  );

  return [api, holder];
}
