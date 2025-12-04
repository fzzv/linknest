import { apiClient } from '@/lib/api-client';

export interface ImportBookmarksResult {
  importedCategories: number;
  importedLinks: number;
}

export const importBookmarks = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<ImportBookmarksResult>('/bookmarks/import', {
    method: 'POST',
    body: formData,
  });
};
