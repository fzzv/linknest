'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@linknest/utils/lib';

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  size?: keyof typeof inputSizes;
  color?: keyof typeof inputColors;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

const inputSizes = {
  xs: 'input-xs',
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
  xl: 'input-xl',
} as const;

const inputColors = {
  neutral: 'input-neutral',
  primary: 'input-primary',
  secondary: 'input-secondary',
  accent: 'input-accent',
  info: 'input-info',
  success: 'input-success',
  warning: 'input-warning',
  error: 'input-error',
} as const;

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  {
    label,
    helperText,
    error,
    size = 'md',
    color = 'neutral',
    fullWidth,
    className,
    wrapperClassName,
    ...props
  },
  ref,
) {
  return (
    <label className={cn('flex flex-col gap-2', fullWidth && 'w-full', wrapperClassName)}>
      {label ? <span className="text-sm font-medium text-slate-200">{label}</span> : null}

      <input
        ref={ref}
        type="file"
        className={cn(
          'file-input',
          inputSizes[size],
          inputColors[error ? 'error' : color],
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
