/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 文件大小，例如：1024 KB = 1 MB
 */
export const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${(kb / 1024).toFixed(1)} MB`;
};
