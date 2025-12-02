'use client';

import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@linknest/utils/lib';

export type SelectOption = {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
};

const selectSizes = {
  xs: 'select-xs',
  sm: 'select-sm',
  md: 'select-md',
  lg: 'select-lg',
  xl: 'select-xl',
} as const;

const selectVariants = {
  solid: 'border border-white/10 text-white/90 placeholder:text-white/60 focus:border-white/30 focus:ring-2 focus:ring-white/15',
  ghost: 'select-ghost',
} as const;

const selectColors = {
  neutral: 'select-neutral',
  primary: 'select-primary',
  secondary: 'select-secondary',
  accent: 'select-accent',
  info: 'select-info',
  success: 'select-success',
  warning: 'select-warning',
  error: 'select-error',
} as const;

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  options?: SelectOption[];
  size?: keyof typeof selectSizes;
  variant?: keyof typeof selectVariants;
  color?: keyof typeof selectColors;
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
    variant = 'solid',
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

      <select
        ref={ref}
        className={cn(
          'select',
          selectSizes[size],
          selectVariants[variant],
          selectColors[color],
          fullWidth && 'w-full',
          error && 'select-error',
          className,
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
      ) : helperText ? (
        <span className="text-xs text-slate-400">{helperText}</span>
      ) : null}
    </label>
  );
});

Select.displayName = 'Select';

export default Select;
