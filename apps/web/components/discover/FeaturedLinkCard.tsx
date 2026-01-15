'use client';

import { cn } from '@linknest/utils';
import { Heart, Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { FeaturedLink, PublicLink } from '@/services/discover';
import { API_BASE_URL } from '@/lib/env';

interface FeaturedLinkCardProps {
  link: FeaturedLink | PublicLink;
  isAuthenticated: boolean;
  onLike: (id: number) => void;
  onUnlike: (id: number) => void;
  className?: string;
}

function buildIconSrc(icon?: string | null) {
  if (!icon) return '';
  const trimmed = icon.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

export default function FeaturedLinkCard({
  link,
  isAuthenticated,
  onLike,
  onUnlike,
  className,
}: FeaturedLinkCardProps) {
  const t = useTranslations('Discover');
  const [isLiked, setIsLiked] = useState(link.isLiked);
  const [likeCount, setLikeCount] = useState(link.likeCount);
  const [isLiking, setIsLiking] = useState(false);

  const iconSrc = buildIconSrc(link.icon);
  const [finalIconSrc, setFinalIconSrc] = useState(iconSrc);
  const fallbackInitial = (link.title || '?').trim().charAt(0).toUpperCase();

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // 可以显示登录提示
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      if (isLiked) {
        onUnlike(link.id);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        onLike(link.id);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'card bg-base-200 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-200 group',
        className,
      )}
    >
      <div className="card-body p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-base-300 flex items-center justify-center">
            {iconSrc ? (
              <img
                src={finalIconSrc}
                alt={link.title}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={() => setFinalIconSrc('/ghost.svg')}
              />
            ) : (
              <span className="text-xl font-semibold text-primary">
                {fallbackInitial}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold line-clamp-1 flex-1">{link.title}</h3>
              <ExternalLink className="w-4 h-4 text-base-content/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
            {link.description && (
              <p className="text-sm text-base-content/60 line-clamp-2 mt-1">
                {link.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-2 text-sm text-base-content/50">
              <button
                onClick={handleLikeClick}
                disabled={isLiking}
                className={cn(
                  'flex items-center gap-1 hover:text-primary transition-colors',
                  isLiked && 'text-primary',
                  !isAuthenticated && 'cursor-default',
                )}
                title={isAuthenticated ? (isLiked ? t('unlike') : t('like')) : t('loginToLike')}
              >
                <Heart
                  className={cn('w-4 h-4', isLiked && 'fill-current')}
                />
                <span>{likeCount}</span>
              </button>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{link.viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

export function FeaturedLinkCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'card bg-base-200 border border-base-300',
        className,
      )}
    >
      <div className="card-body p-4">
        <div className="flex items-start gap-3">
          <div className="skeleton w-12 h-12 rounded-lg shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-5 w-3/4 mb-2" />
            <div className="skeleton h-4 w-full mb-1" />
            <div className="skeleton h-4 w-1/4 mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
