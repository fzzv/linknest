"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import { cn } from '@linknest/utils';
import { INPUT_SIZES, INPUT_COLORS, INPUT_VARIANTS } from './common/constant';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  actionSlot?: ReactNode;
  inputSlot?: ReactNode;
  size?: keyof typeof INPUT_SIZES;
  color?: keyof typeof INPUT_COLORS;
  variant?: keyof typeof INPUT_VARIANTS;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  label,
  error,
  actionSlot,
  inputSlot,
  id,
  color = "primary",
  size = "md",
  variant = "custom",
  className,
  ...props
},
  ref) => {
  const inputId = id ?? useId();

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between text-sm font-medium text-base-content">
        <label htmlFor={inputId}>{label}</label>
        {actionSlot}
      </div>
      <div className="relative w-full">
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={cn(
            'input w-full placeholder-base-content/50',
            INPUT_SIZES[size],
            INPUT_VARIANTS[variant],
            INPUT_COLORS[error ? 'error' : color],
            error && 'focus:outline-none focus:border-error focus:ring-error/30',
            inputSlot && 'pr-10',
            className,
          )}
        />
        {inputSlot ? (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {inputSlot}
          </div>
        ) : null}
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  )
},
);

TextField.displayName = 'TextField';

export default TextField;
