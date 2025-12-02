import { apiClient } from '@/lib/api-client';
import type { AddLinkFormValues } from '@/schemas/link';

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

export const createLink = (payload: AddLinkFormValues) =>
  apiClient<LinkItem>('/links', {
    method: 'POST',
    body: payload,
  });

export const fetchLinkDetail = (id: number) => apiClient<LinkItem>(`/links/${id}`);

export type UpdateLinkPayload = Partial<AddLinkFormValues>;

export const updateLink = (id: number, payload: UpdateLinkPayload) =>
  apiClient<LinkItem>(`/links/${id}`, {
    method: 'PATCH',
    body: payload,
  });

export interface MessageResponse {
  message: string;
}

export const deleteLink = (id: number) =>
  apiClient<MessageResponse>(`/links/${id}`, {
    method: 'DELETE',
  });

export interface UploadLinkIconResponse {
  url: string;
}

export const uploadLinkIcon = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<UploadLinkIconResponse>('/links/upload-icon', {
    method: 'POST',
    body: formData,
  });
};
