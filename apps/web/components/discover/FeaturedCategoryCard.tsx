'use client';

import { cn } from '@linknest/utils';
import type { FeaturedCategory } from '@/services/discover';
import { Link } from '@/i18n/navigation';
import * as LucideIcons from 'lucide-react';
import { Folder, type LucideIcon } from 'lucide-react';

interface FeaturedCategoryCardProps {
  category: FeaturedCategory;
  className?: string;
}

export default function FeaturedCategoryCard({
  category,
  className,
}: FeaturedCategoryCardProps) {
  // 尝试从 lucide-react 获取图标
  const IconComponent: LucideIcon = category.icon
    ? (LucideIcons as unknown as Record<string, LucideIcon>)[category.icon] || Folder
    : Folder;

  return (
    <Link
      href={`/category/${category.id}`}
      className={cn(
        'card bg-base-200 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all duration-200',
        className,
      )}
    >
      <div className="card-body p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-1">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-base-content/60 line-clamp-2 mt-1">
                {category.description}
              </p>
            )}
            <div className="mt-2">
              <span className="badge badge-ghost badge-sm">
                {category.linkCount} links
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedCategoryCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'card bg-base-200 border border-base-300',
        className,
      )}
    >
      <div className="card-body p-5">
        <div className="flex items-start gap-4">
          <div className="skeleton w-12 h-12 rounded-lg" />
          <div className="flex-1">
            <div className="skeleton h-5 w-3/4 mb-2" />
            <div className="skeleton h-4 w-full mb-1" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
