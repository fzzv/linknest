'use client';

import { cn } from '@linknest/utils';
import { type ImgHTMLAttributes, type ReactNode } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarShape = 'circle' | 'square';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  bordered?: boolean;
  fallback?: ReactNode;
  className?: string;
  imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
}

const sizeClassName: Record<AvatarSize, string> = {
  xs: 'w-8',
  sm: 'w-10',
  md: 'w-12',
  lg: 'w-16',
  xl: 'w-20',
};

export function Avatar({
  src,
  alt,
  size = 'md',
  shape = 'circle',
  bordered,
  fallback,
  className,
  imageProps,
}: AvatarProps) {
  const rounded = shape === 'square' ? 'rounded-xl' : 'rounded-full';

  return (
    <div className={cn('avatar')}>
      <div
        className={cn(
          sizeClassName[size],
          rounded,
          'overflow-hidden',
          bordered && 'ring ring-primary ring-offset-base-100 ring-offset-2',
          className
        )}
      >
        {src ? (
          <img src={src} alt={alt ?? ''} {...imageProps} />
        ) : (
          <div className={cn('flex h-full w-full items-center justify-center bg-base-300 text-sm font-semibold', rounded)}>
            {fallback ?? (alt ? alt.charAt(0).toUpperCase() : '?')}
          </div>
        )}
      </div>
    </div>
  );
}
