import { apiClient } from '@/lib/api-client';
import { CategoryFormValues } from '@/schemas/category';

export interface Category {
  id: number;
  name: string;
  icon?: string | null;
  count?: number;
}

export const fetchCategories = () => apiClient<Category[]>('/categories');
export const fetchPublicCategories = () => apiClient<Category[]>('/categories/public');
export const createCategory = (payload: CategoryFormValues) =>
  apiClient<Category>('/categories', { method: 'POST', body: payload });
