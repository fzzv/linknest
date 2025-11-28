import { apiClient } from '@/lib/api-client';

export interface Category {
  id: number;
  name: string;
  icon?: string | null;
  count?: number;
}

export const fetchCategories = () => apiClient<Category[]>('/categories');
