'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@linknest/utils/lib';

const inputSizes = {
  xs: 'input-xs',
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
  xl: 'input-xl',
} as const;

const inputVariants = {
  solid: 'border',
  ghost: 'input-ghost',
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

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  size?: keyof typeof inputSizes;
  variant?: keyof typeof inputVariants;
  color?: keyof typeof inputColors;
  fullWidth?: boolean;
  wrapperClassName?: string;
  actionSlot?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  {
    label,
    helperText,
    error,
    size = 'md',
    variant = 'solid',
    color = 'neutral',
    fullWidth,
    className,
    wrapperClassName,
    actionSlot,
    ...props
  },
  ref,
) {
  return (
    <label className={cn('flex flex-col gap-2', fullWidth && 'w-full', wrapperClassName)}>
      {label ? (
        <div className="flex items-center justify-between text-sm font-medium text-slate-200">
          <span>{label}</span>
          {actionSlot}
        </div>
      ) : null}

      <input
        ref={ref}
        className={cn(
          'input',
          inputSizes[size],
          inputVariants[variant],
          fullWidth && 'w-full',
          className,
          inputColors[error ? 'error' : color],
          error && 'focus:outline-none focus:ring-1 focus:ring-error'
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

InputField.displayName = 'InputField';

export default InputField;
