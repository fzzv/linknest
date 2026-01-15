'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useMessage } from '@linknest/ui';
import {
  DiscoverNavbar,
  HeroSection,
  FeaturedCategoryCard,
  FeaturedCategoryCardSkeleton,
  FeaturedLinkCard,
  FeaturedLinkCardSkeleton,
  Footer,
} from '@/components/discover';
import {
  fetchFeaturedCategories,
  fetchFeaturedLinks,
  fetchRecentPublicLinks,
  likeLink,
  unlikeLink,
  type FeaturedCategory,
  type FeaturedLink,
  type PublicLink,
} from '@/services/discover';

export default function DiscoverPage() {
  const t = useTranslations('Discover');
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [message, messageHolder] = useMessage({ placement: 'top' });

  // State
  const [featuredCategories, setFeaturedCategories] = useState<FeaturedCategory[]>([]);
  const [featuredLinks, setFeaturedLinks] = useState<FeaturedLink[]>([]);
  const [recentLinks, setRecentLinks] = useState<PublicLink[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingFeaturedLinks, setIsLoadingFeaturedLinks] = useState(true);
  const [isLoadingRecentLinks, setIsLoadingRecentLinks] = useState(true);

  // Load featured categories
  const loadFeaturedCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const data = await fetchFeaturedCategories();
      setFeaturedCategories(data);
    } catch (error) {
      console.error('Failed to load featured categories', error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Load featured links (this week's hot)
  const loadFeaturedLinks = useCallback(async () => {
    setIsLoadingFeaturedLinks(true);
    try {
      const data = await fetchFeaturedLinks(10);
      setFeaturedLinks(data);
    } catch (error) {
      console.error('Failed to load featured links', error);
    } finally {
      setIsLoadingFeaturedLinks(false);
    }
  }, []);

  // Load recent public links
  const loadRecentLinks = useCallback(async () => {
    setIsLoadingRecentLinks(true);
    try {
      const data = await fetchRecentPublicLinks(12);
      setRecentLinks(data);
    } catch (error) {
      console.error('Failed to load recent links', error);
    } finally {
      setIsLoadingRecentLinks(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFeaturedCategories();
    loadFeaturedLinks();
    loadRecentLinks();
  }, [loadFeaturedCategories, loadFeaturedLinks, loadRecentLinks]);

  // Handlers
  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLike = async (id: number) => {
    if (!isAuthenticated) {
      message.warning(t('loginToLike'));
      return;
    }
    try {
      await likeLink(id);
    } catch (error) {
      message.error('Failed to like');
    }
  };

  const handleUnlike = async (id: number) => {
    if (!isAuthenticated) return;
    try {
      await unlikeLink(id);
    } catch (error) {
      message.error('Failed to unlike');
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {messageHolder}

      {/* Navbar */}
      <DiscoverNavbar onSearch={handleSearch} />

      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('featuredCategories')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoadingCategories
            ? Array.from({ length: 8 }).map((_, i) => (
                <FeaturedCategoryCardSkeleton key={i} />
              ))
            : featuredCategories.map((category) => (
                <FeaturedCategoryCard key={category.id} category={category} />
              ))}
        </div>
        {!isLoadingCategories && featuredCategories.length === 0 && (
          <p className="text-center text-base-content/60 py-8">
            {t('noResults')}
          </p>
        )}
      </section>

      {/* This Week's Hot Links */}
      <section className="container mx-auto px-4 py-12 bg-base-200/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('thisWeekHot')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingFeaturedLinks
            ? Array.from({ length: 6 }).map((_, i) => (
                <FeaturedLinkCardSkeleton key={i} />
              ))
            : featuredLinks.map((link) => (
                <FeaturedLinkCard
                  key={link.id}
                  link={link}
                  isAuthenticated={isAuthenticated}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))}
        </div>
        {!isLoadingFeaturedLinks && featuredLinks.length === 0 && (
          <p className="text-center text-base-content/60 py-8">
            {t('noResults')}
          </p>
        )}
      </section>

      {/* Recently Public */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('recentlyPublic')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingRecentLinks
            ? Array.from({ length: 6 }).map((_, i) => (
                <FeaturedLinkCardSkeleton key={i} />
              ))
            : recentLinks.map((link) => (
                <FeaturedLinkCard
                  key={link.id}
                  link={link}
                  isAuthenticated={isAuthenticated}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))}
        </div>
        {!isLoadingRecentLinks && recentLinks.length === 0 && (
          <p className="text-center text-base-content/60 py-8">
            {t('noResults')}
          </p>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
