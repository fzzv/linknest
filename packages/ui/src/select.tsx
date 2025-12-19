'use client';

import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@linknest/utils';
import { SELECT_SIZES, SELECT_COLORS, SELECT_VARIANTS } from './common/constant';

export type SelectOption = {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
};

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  options?: SelectOption[];
  size?: keyof typeof SELECT_SIZES;
  color?: keyof typeof SELECT_COLORS;
  variant?: keyof typeof SELECT_VARIANTS;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helperText,
    error,
    options,
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
      {label && <span className="text-sm font-medium text-base-content">{label}</span>}

      <select
        ref={ref}
        className={cn(
          'select cursor-pointer rounded-md',
          SELECT_SIZES[size],
          SELECT_VARIANTS[variant],
          SELECT_COLORS[error ? 'error' : color],
          error && 'focus:outline-none focus:ring-1 focus:ring-error',
          fullWidth && 'w-full',
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {options
          ? options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))
          : props.children}
      </select>

      {error ? (
        <span className="text-xs text-error">{error}</span>
      ) : (
        helperText && <span className="text-xs text-base-content/70">{helperText}</span>
      )}
    </label>
  );
});

Select.displayName = 'Select';

export default Select;
