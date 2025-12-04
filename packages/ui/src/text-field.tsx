"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@linknest/utils';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  actionSlot?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, actionSlot, className, ...props }, ref) => {
    return (
      <label className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between text-sm font-medium text-slate-200">
          <span>{label}</span>
          {actionSlot}
        </div>
        <input
          ref={ref}
          {...props}
          className={cn(
            'h-12 rounded-xl border border-slate-700 bg-transparent px-4 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-500',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : '',
            className,
          )}
        />
        {error ? <span className="text-xs text-red-400">{error}</span> : null}
      </label>
    )
  },
);

TextField.displayName = 'TextField';

export default TextField;
