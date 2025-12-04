'use client';

import { cn } from '@linknest/utils';
import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

type UploadVariant = 'button' | 'avatar' | 'dropzone';

export interface UploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'onSelect'> {
  /**
   * 展示样式
   * - button：按钮样式
   * - avatar：头像样式（支持预览）
   * - dropzone：拖拽上传区域
   */
  variant?: UploadVariant;
  /**
   * 头像样式时的形状
   */
  shape?: 'circle' | 'square';
  /**
   * 是否支持拖拽上传
   */
  draggable?: boolean;
  /**
   * 选中文件后的回调
   */
  onSelect?: (files: File[]) => void;
  /**
   * 仅返回第一个文件的回调
   */
  onFileSelect?: (file: File) => void;
  /**
   * 触发器/区域的自定义内容
   */
  children?: ReactNode;
  /**
   * 附加描述
   */
  description?: ReactNode;
  /**
   * 辅助提示
   */
  hint?: ReactNode;
  /**
   * 自定义图标
   */
  icon?: ReactNode;
  /**
   * 头像样式时的图片地址
   */
  value?: string;
  /**
   * 头像样式叠层文案
   */
  overlayText?: ReactNode;
  /**
   * 外层类名
   */
  className?: string;
}

const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 4v10m0 0 4-4m-4 4-4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Upload = forwardRef<HTMLInputElement, UploadProps>(function Upload(
  {
    variant = 'button',
    shape = 'circle',
    draggable = variant !== 'button',
    onSelect,
    onFileSelect,
    children,
    description,
    hint,
    icon,
    value,
    overlayText = 'Upload',
    className,
    disabled,
    multiple,
    accept,
    name,
    ...inputProps
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const allowDrop = draggable && !disabled;

  const triggerSelect = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      onSelect?.(files);
      if (files[0]) {
        onFileSelect?.(files[0]);
      }
    },
    [onFileSelect, onSelect],
  );

  const resetInputValue = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    triggerSelect(event.target.files);
    resetInputValue();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!allowDrop) return;
    event.preventDefault();
    setIsDragging(false);
    triggerSelect(event.dataTransfer?.files ?? null);
    resetInputValue();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!allowDrop) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    if (!allowDrop) return;
    setIsDragging(false);
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const sharedDropProps = allowDrop
    ? {
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      }
    : {};

  const baseContainerClass = cn(
    'cursor-pointer transition',
    disabled && 'cursor-not-allowed opacity-60',
    isDragging && 'border-primary bg-primary/5',
    className,
  );

  const renderAvatar = () => (
    <div
      role="button"
      aria-label="Upload avatar"
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'group relative inline-flex h-28 w-28 items-center justify-center overflow-hidden border border-dashed border-white/10 bg-white/5',
        shape === 'circle' ? 'rounded-full' : 'rounded-2xl',
        'hover:border-white/30 hover:bg-white/10',
        baseContainerClass,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...sharedDropProps}
    >
      {value ? (
        <img
          src={value}
          alt="avatar preview"
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70">
          {icon ?? <PlusIcon className="h-7 w-7" />}
          <span className="text-xs font-semibold">Upload</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
        <span className="text-xs font-semibold text-white">{overlayText}</span>
      </div>
    </div>
  );

  const renderDropzone = () => (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload file"
      className={cn(
        'group flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 px-6 py-10 text-center',
        'hover:border-white/30 hover:bg-white/5',
        baseContainerClass,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...sharedDropProps}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/70">
        {icon ?? <UploadIcon className="h-6 w-6" />}
      </div>
      <div className="mt-4 text-sm font-semibold text-white">
        {children ?? 'Click or drag file to this area'}
      </div>
      {description ? <p className="mt-2 text-xs text-white/70">{description}</p> : null}
      {hint ? <p className="mt-3 text-xs text-white/50">{hint}</p> : null}
    </div>
  );

  const renderButton = () => (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20',
        'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        baseContainerClass,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Upload file"
    >
      {icon ?? <UploadIcon className="h-4 w-4" />}
      <span>{children ?? 'Upload'}</span>
    </button>
  );

  return (
    <>
      <input
        id={inputId}
        ref={inputRef}
        name={name}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        onChange={handleInputChange}
        {...inputProps}
      />

      {variant === 'avatar'
        ? renderAvatar()
        : variant === 'dropzone'
          ? renderDropzone()
          : renderButton()}
    </>
  );
});

Upload.displayName = 'Upload';

export default Upload;
