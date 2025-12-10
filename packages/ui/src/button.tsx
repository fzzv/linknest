'use client';

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@linknest/utils";
import { BUTTON_SIZES, BUTTON_COLORS, BUTTON_VARIANTS } from './common/constant';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
  size?: keyof typeof BUTTON_SIZES;
  color?: keyof typeof BUTTON_COLORS;
  variant?: keyof typeof BUTTON_VARIANTS;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = ({
  children,
  className,
  variant = "custom",
  size = "md",
  color = "primary",
  fullWidth,
  isLoading,
  disabled,
  leftIcon,
  rightIcon,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "btn gap-2 rounded-md font-semibold normal-case transition",
        BUTTON_SIZES[size],
        BUTTON_COLORS[color],
        BUTTON_VARIANTS[variant],
        fullWidth && "w-full",
        (disabled || isLoading) && "btn-disabled",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="loading loading-spinner loading-xs" />}
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};
