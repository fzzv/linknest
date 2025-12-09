import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { UPLOAD_ROOT } from "./upload.utils";

/**
 * 将时间戳或日期对象转换为秒级时间戳
 * @param value 时间戳或日期对象
 * @returns 秒级时间戳
 */
export function toEpoch(value: number | Date) {
  const date = typeof value === 'number' ? new Date(value) : value;
  return Math.floor(date.getTime() / 1000);
}

/**
 * 转义 HTML 字符
 * @param value 需要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 转义 HTML 属性
 * @param value 需要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeAttr(value: string) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

/**
 * 根据文件扩展名获取 MIME 类型
 * @param ext 文件扩展名
 * @returns MIME 类型
 */
export function getMimeFromExt(ext: string) {
  const key = ext.toLowerCase().replace('.', '');
  const map: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    webp: 'image/webp',
    avif: 'image/avif',
  };
  return map[key] ?? 'application/octet-stream';
}

/**
 * 将本地文件转换为 Base64 数据 URL
 * @param icon 本地文件路径
 * @returns Base64 数据 URL
 */
export async function iconToDataUrl(icon: string) {
  if (icon.startsWith('data:')) {
    return icon;
  }

  // 仅处理本地 uploads 下的资源，其余保持原样
  const cleaned = icon.replace(/^\/+/, '');
  if (!cleaned.startsWith('uploads/')) {
    return icon;
  }

  const fullPath = join(UPLOAD_ROOT, cleaned.replace(/^uploads\//, ''));
  try {
    const buffer = await readFile(fullPath);
    const mime = getMimeFromExt(extname(fullPath));
    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch {
    return icon;
  }
}

/**
 * 构建书签导出文件名
 * @param timestamp 时间戳
 * @returns 文件名
 */
export function buildFilename(timestamp: number) {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `bookmarks_${yyyy}_${mm}_${dd}.html`;
}
