import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join, posix } from 'node:path';

// 统一的上传根目录，位于 apps/api/uploads
export const UPLOAD_ROOT = join(__dirname, '..', '..', 'uploads');

/**
 * 过滤目录名，避免 ..、空段等路径穿越问题
 * @param input 输入的目录名
 * @returns 过滤后的目录名
 */
export function sanitizeDir(input?: string) {
  const normalized = (input ?? '').replace(/\\/g, '/').trim();
  const segments = normalized
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment && segment !== '.' && segment !== '..');
  return segments.length ? segments.join('/') : 'common';
}

/**
 * 确保物理目录存在
 * @param dir 目录
 * @returns 物理目录路径
 */
export function ensureUploadDir(dir: string) {
  const fullPath = join(UPLOAD_ROOT, dir);
  mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

/**
 * 解析文件路径和 URL
 * @param dir 目录
 * @param filename 文件名
 * @returns 文件路径和 URL
 */
export function resolveFilePaths(dir: string, filename: string) {
  const path = posix.join('uploads', dir, filename);
  const url = posix.join('/uploads', dir, filename);
  return { path, url };
}

/**
 * 提取文件扩展名
 * @param originalName 原始文件名
 * @returns 文件扩展名
 */
export function extractExt(originalName: string) {
  const ext = extname(originalName);
  if (!ext) {
    return null;
  }
  return ext.replace('.', '') || null;
}

/**
 * 随机生成文件名
 * @param originalName 原始文件名
 * @returns 随机生成后的文件名
 */
export function randomizeFilename(originalName: string) {
  const ext = extname(originalName);
  return `${randomUUID()}${ext}`;
}

// Multer 会将 multipart filename 解析为 latin1，需要手动转成 UTF-8 以避免中文乱码
export function decodeOriginalName(name: string) {
  return Buffer.from(name, 'latin1').toString('utf8');
}
