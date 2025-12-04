'use client';

import { cn } from '@linknest/utils';
import { type HTMLAttributes } from 'react';

const placementClassName = {
  top: 'tooltip-top',
  bottom: 'tooltip-bottom',
  left: 'tooltip-left',
  right: 'tooltip-right',
} as const;

const variantClassName = {
  neutral: 'tooltip-neutral',
  primary: 'tooltip-primary',
  secondary: 'tooltip-secondary',
  accent: 'tooltip-accent',
  info: 'tooltip-info',
  success: 'tooltip-success',
  warning: 'tooltip-warning',
  error: 'tooltip-error',
} as const;

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content?: string;
  placement?: keyof typeof placementClassName;
  variant?: keyof typeof variantClassName;
}

export function Tooltip({
  children,
  content,
  placement = 'top',
  variant = 'neutral',
  className,
  ...props
}: TooltipProps) {
  if (content === undefined || content === null) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        'tooltip',
        placementClassName[placement],
        variantClassName[variant],
        className,
      )}
      data-tip={content}
      {...props}
    >
      {children}
    </div>
  );
}

export default Tooltip;
