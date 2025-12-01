import { apiClient } from '@/lib/api-client';

export interface LinkItem {
  id: number;
  title: string;
  url: string;
  description?: string | null;
  icon?: string | null;
  cover?: string | null;
  sortOrder: number;
  categoryId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const fetchLinks = (categoryId?: number) => {
  const search = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  return apiClient<LinkItem[]>(`/links${search}`);
};

export const fetchPublicLinks = (categoryId?: number) => {
  const search = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  return apiClient<LinkItem[]>(`/links/public${search}`);
};
