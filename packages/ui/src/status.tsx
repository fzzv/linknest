"use client";

import { type HTMLAttributes } from 'react';
import { cn } from '@linknest/utils';
import { STATUS_COLORS, STATUS_SIZES, STATUS_VARIANTS } from './common/constant';

export type StatusColor = keyof typeof STATUS_COLORS;
export type StatusSize = keyof typeof STATUS_SIZES;
export type StatusVariants = keyof typeof STATUS_VARIANTS

export interface StatusProps extends HTMLAttributes<HTMLSpanElement> {
  color?: StatusColor;
  size?: StatusSize;
  variant?: StatusVariants;
}

export function Status({
  color = 'custom',
  size = 'md',
  variant = 'custom',
  className,
  ...props
}: StatusProps) {
  return (
    <span
      {...props}
      className={cn('status', STATUS_SIZES[size], STATUS_COLORS[color], STATUS_VARIANTS[variant], className)}
    />
  );
}
