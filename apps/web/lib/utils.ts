import { API_BASE_URL } from './env'
/**
 * 拼接文件完整地址
 * @param filePath 文件路径或者url
 * @returns 完整路径
 */
export function buildFileSrc(filePath?: string | undefined) {
  if (!filePath) return '';
  const trimmed = filePath.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}
