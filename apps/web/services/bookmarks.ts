import { apiClient } from '@/lib/api-client';
import { parseFilenameFromHeader } from '@linknest/utils';

export interface ImportBookmarksResult {
  importedCategories: number;
  importedLinks: number;
}

// 导入书签
export const importBookmarks = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<ImportBookmarksResult>('/bookmarks/import', {
    method: 'POST',
    body: formData,
  });
};

// 导出书签
export const exportBookmarks = async () => {
  return apiClient<{ blob: Blob; filename: string }>('/bookmarks/export', {
    method: 'GET',
    handleResponse: async (res: Response) => {
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const filename =
        parseFilenameFromHeader(res.headers.get('content-disposition')) ??
        `bookmarks_${new Date().toISOString().slice(0, 10)}.html`;
      return { blob, filename };
    },
  });
};
