'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@linknest/utils';
import { INPUT_SIZES, INPUT_COLORS, INPUT_VARIANTS } from './common/constant';

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  size?: keyof typeof INPUT_SIZES;
  color?: keyof typeof INPUT_COLORS;
  variant?: keyof typeof INPUT_VARIANTS;
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
    color = 'neutral',
    variant = 'custom',
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
        <div className="flex items-center justify-between text-sm font-medium text-base-content">
          <span>{label}</span>
          {actionSlot}
        </div>
      ) : null}

      <input
        ref={ref}
        className={cn(
          'input',
          INPUT_SIZES[size],
          INPUT_VARIANTS[variant],
          INPUT_COLORS[error ? 'error' : color],
          error && 'focus:outline-none focus:ring-1 focus:ring-error',
          fullWidth && 'w-full',
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />

      {error ? (
        <span className="text-xs text-error">{error}</span>
      ) : (
        helperText && <span className="text-xs text-base-content/70">{helperText}</span>
      )}
    </label>
  );
});

InputField.displayName = 'InputField';

export default InputField;
