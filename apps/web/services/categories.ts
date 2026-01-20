import { apiClient } from '@/lib/api-client';
import { CategoryFormValues } from '@/schemas/category';

export interface Category {
  id: number;
  name: string;
  icon?: string | null;
  sortOrder?: number;
  count?: number;
  isPublic?: boolean;
}

export const fetchCategories = () => apiClient<Category[]>('/categories');
export const fetchPublicCategories = () => apiClient<Category[]>('/categories/public');
export const fetchCategoryDetail = (id: number) => apiClient<Category>(`/categories/${id}`);
export const createCategory = (payload: CategoryFormValues) =>
  apiClient<Category>('/categories', { method: 'POST', body: payload });
export const updateCategory = (id: number, payload: CategoryFormValues) =>
  apiClient<Category>(`/categories/${id}`, { method: 'PATCH', body: payload });
export const deleteCategory = (id: number) =>
  apiClient<{ message: string }>(`/categories/${id}`, { method: 'DELETE' });
