'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useMessage } from '@linknest/ui';
import { Link } from '@/i18n/navigation';
import {
  DiscoverNavbar,
  FeaturedLinkCard,
  FeaturedLinkCardSkeleton,
  FilterTabs,
  Footer,
} from '@/components/discover';
import {
  fetchCategoryDetail,
  likeLink,
  unlikeLink,
  type CategoryDetail,
} from '@/services/discover';

type SortValue = 'latest' | 'popular' | 'recommended';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = Number(params.id);
  const t = useTranslations('Discover');
  const { isAuthenticated } = useAuthStore();
  const [message, messageHolder] = useMessage({ placement: 'top' });

  // State
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState<SortValue>('recommended');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  // Load category detail
  const loadCategory = useCallback(async (reset = false) => {
    if (isNaN(categoryId)) return;

    setIsLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;
      const data = await fetchCategoryDetail(categoryId, sort, LIMIT, currentOffset);

      if (reset) {
        setCategory(data);
        setOffset(LIMIT);
      } else {
        setCategory((prev) =>
          prev
            ? { ...prev, links: [...prev.links, ...data.links] }
            : data,
        );
        setOffset((prev) => prev + LIMIT);
      }
      setHasMore(data.links.length === LIMIT);
    } catch (error) {
      console.error('Failed to load category', error);
      message.error('Failed to load category');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, sort, offset, message]);

  // Initial load and sort change
  useEffect(() => {
    setOffset(0);
    loadCategory(true);
  }, [categoryId, sort]);

  // Handlers
  const handleSortChange = (value: SortValue) => {
    setSort(value);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadCategory(false);
    }
  };

  const handleLike = async (id: number) => {
    if (!isAuthenticated) {
      message.warning(t('loginToLike'));
      return;
    }
    try {
      await likeLink(id);
      // Update local state
      setCategory((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          links: prev.links.map((link) =>
            link.id === id
              ? { ...link, isLiked: true, likeCount: link.likeCount + 1 }
              : link,
          ),
        };
      });
    } catch (error) {
      message.error('Failed to like');
    }
  };

  const handleUnlike = async (id: number) => {
    if (!isAuthenticated) return;
    try {
      await unlikeLink(id);
      // Update local state
      setCategory((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          links: prev.links.map((link) =>
            link.id === id
              ? { ...link, isLiked: false, likeCount: Math.max(0, link.likeCount - 1) }
              : link,
          ),
        };
      });
    } catch (error) {
      message.error('Failed to unlike');
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {messageHolder}

      {/* Navbar */}
      <DiscoverNavbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToHome')}</span>
          </Link>

          {category ? (
            <>
              <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-base-content/70 mt-2">
                  {category.description}
                </p>
              )}
              <p className="text-sm text-base-content/50 mt-4">
                {t('linksCount', { count: category.total })}
              </p>
            </>
          ) : (
            <>
              <div className="skeleton h-10 w-48 mb-2" />
              <div className="skeleton h-6 w-96" />
            </>
          )}
        </div>
      </section>

      {/* Filter & Content */}
      <section className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <FilterTabs value={sort} onChange={handleSortChange} />
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && !category
            ? Array.from({ length: 9 }).map((_, i) => (
                <FeaturedLinkCardSkeleton key={i} />
              ))
            : category?.links.map((link) => (
                <FeaturedLinkCard
                  key={link.id}
                  link={link}
                  isAuthenticated={isAuthenticated}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))}
        </div>

        {/* Empty State */}
        {!isLoading && category?.links.length === 0 && (
          <p className="text-center text-base-content/60 py-12">
            {t('noResults')}
          </p>
        )}

        {/* Load More */}
        {hasMore && category && category.links.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="btn btn-outline btn-primary"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                t('loadMore')
              )}
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
