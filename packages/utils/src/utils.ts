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

/**
 * 下载文件
 * @param {Blob|string} data  Blob 或者 已有的 url
 * @param {string} filename 文件名
 * @returns void
 */
export async function download(data: Blob | string, filename: string) {
  const isBlob = data instanceof Blob;
  const url = isBlob ? URL.createObjectURL(data) : String(data);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? '';
  a.rel = 'noopener'; // 安全习惯
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  a.remove();

  // 释放 objectURL（稍微延迟一下更稳，避免某些浏览器还没开始读就 revoke）
  if (isBlob) {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * 解析文件名
 * @param headerValue 响应头中的文件名
 * @returns 解析后的文件名
 */
export const parseFilenameFromHeader = (headerValue?: string | null) => {
  if (!headerValue) return null;
  const utf8Match = headerValue.match(/filename\\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const asciiMatch = headerValue.match(/filename=\"?([^\";]+)\"?/i);
  return asciiMatch?.[1] ?? null;
};
