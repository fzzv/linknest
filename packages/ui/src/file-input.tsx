'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@linknest/utils';
import { INPUT_SIZES, INPUT_COLORS, INPUT_VARIANTS } from './common/constant';

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  size?: keyof typeof INPUT_SIZES;
  color?: keyof typeof INPUT_COLORS;
  variant?: keyof typeof INPUT_VARIANTS;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  {
    label,
    helperText,
    error,
    size = 'md',
    color = 'neutral',
    variant = 'custom',
    fullWidth,
    className,
    wrapperClassName,
    ...props
  },
  ref,
) {
  return (
    <label className={cn('flex flex-col gap-2', fullWidth && 'w-full', wrapperClassName)}>
      {label ? <span className="text-sm font-medium text-base-content">{label}</span> : null}

      <input
        ref={ref}
        type="file"
        className={cn(
          'file-input',
          INPUT_SIZES[size],
          INPUT_VARIANTS[variant],
          INPUT_COLORS[error ? 'error' : color],
          fullWidth && 'w-full',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />

      {error ? (
        <span className="text-xs text-error">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-400">{helperText}</span>
      ) : null}
    </label>
  );
});

FileInput.displayName = 'FileInput';

export default FileInput;
