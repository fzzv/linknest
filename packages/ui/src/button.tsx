'use client';

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@linknest/utils";

const buttonVariants = {
  soft: "btn-soft",
  outline: "btn-outline",
  dash: "btn-dash",
  active: "btn-active",
  ghost: "btn-ghost",
  link: "btn-link",
  wide: "btn-wide",
  square: "btn-square",
  circle: "btn-circle",
  block: "btn-block",
  custom: "",
} as const;

const buttonColors = {
  neutral: "btn-neutral",
  primary: "btn-primary",
  secondary: "btn-secondary ",
  accent: "btn-accent",
  info: "btn-info",
  success: "btn-success",
  warning: "btn-warning",
  error: "btn-error",
  custom: "",
} as const;

const buttonSizes = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  icon: "btn-square btn-sm p-0",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
  variant?: keyof typeof buttonVariants;
  color?: keyof typeof buttonColors;
  size?: keyof typeof buttonSizes;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = ({
  children,
  className,
  variant = "soft",
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
        "btn gap-2 rounded-2xl font-semibold normal-case transition",
        buttonVariants[variant],
        buttonColors[color],
        buttonSizes[size],
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
