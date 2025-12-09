import { apiClient } from '@/lib/api-client';
import type { UpdateUserFormValues } from '@/schemas/user'
import type { User } from '@/services/auth';

export interface UploadedFile {
  id: number;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  ext: string | null;
  dir: string;
  path: string;
  url: string;
  uploaderId: number | null;
  createdAt: string;
}

export interface UploadFilesResponse {
  files: UploadedFile[];
}

export const updateUserProfile = (payload: UpdateUserFormValues) =>
  apiClient<User>('/users/me', {
    method: 'PATCH',
    body: payload,
  });

export const uploadAvatar = (file: File, options?: { userId: number }) => {
  const formData = new FormData();
  formData.append('dir', 'avatars');
  formData.append('usage', 'avatar');
  formData.append('entityType', 'User')
  formData.append('entityId', String(options?.userId))
  formData.append('files', file);

  return apiClient<UploadFilesResponse>('/uploads', {
    method: 'POST',
    body: formData,
  });
};
