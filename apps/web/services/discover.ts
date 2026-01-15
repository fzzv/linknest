import { apiClient } from '@/lib/api-client';

// ==========================================
// Types
// ==========================================

export interface FeaturedCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  linkCount: number;
}

export interface FeaturedLink {
  id: number;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
}

export interface PublicLink extends FeaturedLink {
  createdAt: string;
  category: {
    id: number;
    name: string;
  };
}

export interface CategoryDetail {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  links: PublicLink[];
  total: number;
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

// ==========================================
// API Functions
// ==========================================

/**
 * 获取精选分类（首页用）
 */
export const fetchFeaturedCategories = () =>
  apiClient<FeaturedCategory[]>('/discover/featured-categories');

/**
 * 获取本周热门链接
 */
export const fetchFeaturedLinks = (limit?: number) => {
  const params = limit ? `?limit=${limit}` : '';
  return apiClient<FeaturedLink[]>(`/discover/featured-links${params}`);
};

/**
 * 获取最近公开的链接
 */
export const fetchRecentPublicLinks = (limit?: number, offset?: number) => {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (offset) params.set('offset', String(offset));
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient<PublicLink[]>(`/discover/recent-public${query}`);
};

/**
 * 获取分类详情及其链接
 */
export const fetchCategoryDetail = (
  id: number,
  sort?: 'latest' | 'popular' | 'recommended',
  limit?: number,
  offset?: number,
) => {
  const params = new URLSearchParams();
  if (sort) params.set('sort', sort);
  if (limit) params.set('limit', String(limit));
  if (offset) params.set('offset', String(offset));
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient<CategoryDetail>(`/discover/category/${id}${query}`);
};

/**
 * 搜索公开内容
 */
export const searchPublicContent = (
  q: string,
  limit?: number,
  offset?: number,
) => {
  const params = new URLSearchParams({ q });
  if (limit) params.set('limit', String(limit));
  if (offset) params.set('offset', String(offset));
  return apiClient<PublicLink[]>(`/discover/search?${params.toString()}`);
};

/**
 * 点赞链接
 */
export const likeLink = (id: number) =>
  apiClient<LikeResponse>(`/links/${id}/like`, { method: 'POST' });

/**
 * 取消点赞
 */
export const unlikeLink = (id: number) =>
  apiClient<LikeResponse>(`/links/${id}/like`, { method: 'DELETE' });

/**
 * 增加浏览量
 */
export const incrementViewCount = (id: number) =>
  apiClient<{ message: string }>(`/links/${id}/view`, { method: 'POST' });
