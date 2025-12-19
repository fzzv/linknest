/**
 * 该文件用于设置默认的公共分类和公共链接
 */

import { PrismaClient } from '../generated/prisma/client';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

// 选择初始化文件的名称
const INIT_FILE_NAME = 'init_default_link.json';

type InitFolderNode = {
  type: 'folder';
  title: string;
  children?: InitNode[];
};

type InitLinkNode = {
  type: 'link';
  title: string;
  url: string;
  icon?: string;
  description?: string;
};

type InitNode = InitFolderNode | InitLinkNode;

/**
 * 加载环境变量
 */
function loadEnv() {
  const envCandidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'packages/db/.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
  ];
  const envPath = envCandidates.find((p) => existsSync(p));
  if (envPath) {
    dotenv.config({ path: envPath });
  }
}

/**
 * 解析上传目录
 */
function resolveUploadsDir(): string {
  const candidates = [
    path.resolve(process.cwd(), 'apps/api/uploads/linkicons'),
    path.resolve(process.cwd(), '../apps/api/uploads/linkicons'),
    path.resolve(process.cwd(), '../../apps/api/uploads/linkicons'),
    path.resolve(__dirname, '../../../apps/api/uploads/linkicons'),
    path.resolve(__dirname, '../../../../apps/api/uploads/linkicons'),
  ];
  const found = candidates.find((candidate) => existsSync(path.resolve(candidate, '..')));
  if (!found) {
    throw new Error(`uploads/linkicons directory not found. Tried: ${candidates.join(', ')}`);
  }
  return found;
}

/**
 * 获取扩展名
 * @param mime - 媒体类型
 * @param iconUrl - 图标 URL
 * @returns 扩展名
 */
function getExtension(mime: string | null, iconUrl: string) {
  const mimeMap: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  const normalizedMime = mime?.toLowerCase() ?? '';
  if (mimeMap[normalizedMime]) return mimeMap[normalizedMime];

  try {
    const url = new URL(iconUrl);
    const ext = path.extname(url.pathname).replace('.', '').toLowerCase();
    if (ext) return ext;
  } catch {
    throw new Error(`Invalid icon URL: ${iconUrl}`);
  }

  return 'png';
}

/**
 * 存储图标到本地
 * @param icon - 图标 URL
 * @returns 图标路径
 */
async function persistIcon(icon?: string): Promise<string | null> {
  if (!icon) return null;

  const trimmed = icon.trim();
  if (!trimmed) return null;

  const isRemote = trimmed.startsWith('http://') || trimmed.startsWith('https://');
  const looksLocal = trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/');

  if (!isRemote) {
    return looksLocal ? (trimmed.startsWith('/') ? trimmed : `/${trimmed}`) : trimmed;
  }

  try {
    const response = await fetch(trimmed);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const hash = createHash('md5').update(buffer).digest('hex');
    const filename = `${hash}.${getExtension(response.headers.get('content-type'), trimmed)}`;
    const dir = resolveUploadsDir();
    await mkdir(dir, { recursive: true });
    const filePath = path.resolve(dir, filename);
    try {
      await writeFile(filePath, buffer, { flag: 'wx' });
    } catch (error) {
      const writeError = error as NodeJS.ErrnoException;
      if (writeError.code !== 'EEXIST') {
        throw writeError;
      }
    }
    return path.posix.join('/uploads', 'linkicons', filename);
  } catch (error) {
    // 如果下载失败，保留原始地址，避免中断整个 Seed 过程
    console.warn(`Failed to fetch icon ${trimmed}: ${(error as Error).message}`);
    return trimmed;
  }
}

/**
 * 解析初始化 JSON 文件路径
 * @returns 初始化 JSON 文件路径
 */
function resolveInitJsonPath(): string {
  const candidates = [
    path.resolve(process.cwd(), `src/${INIT_FILE_NAME}`),
    path.resolve(process.cwd(), `packages/db/src/${INIT_FILE_NAME}`),
    path.resolve(__dirname, `${INIT_FILE_NAME}`),
    path.resolve(__dirname, `../../src/${INIT_FILE_NAME}`),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    throw new Error(`${INIT_FILE_NAME} not found. Tried: ${candidates.join(', ')}`);
  }
  return found;
}

/**
 * 加载初始化 JSON 文件
 */
async function loadInitJson(): Promise<InitFolderNode[]> {
  const filePath = resolveInitJsonPath();
  const raw = await readFile(filePath, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${INIT_FILE_NAME} must be a JSON array`);
  }
  return parsed as InitFolderNode[];
}

/**
 * 查找或创建公共分类
 * @param prisma - Prisma 客户端
 * @param input - 分类输入
 * @returns 公共分类
 */
async function findOrCreatePublicCategory(
  prisma: PrismaClient,
  input: { name: string; parentId: number | null; sortOrder: number },
) {
  const existing = await prisma.category.findFirst({
    where: { userId: null, isPublic: true, parentId: input.parentId, name: input.name },
  });
  if (existing) return existing;

  return prisma.category.create({
    data: {
      name: input.name,
      userId: null,
      isPublic: true,
      parentId: input.parentId,
      sortOrder: input.sortOrder,
    },
  });
}

/**
 * 查找或创建公共链接
 * @param prisma - Prisma 客户端
 * @param input - 链接输入
 * @returns 公共链接
 */
async function findOrCreatePublicLink(
  prisma: PrismaClient,
  input: { categoryId: number; sortOrder: number; title: string; url: string; icon?: string; description?: string },
) {
  const existing = await prisma.link.findFirst({
    where: { userId: null, categoryId: input.categoryId, url: input.url },
  });
  if (existing) {
    if (input.icon && existing.icon !== input.icon) {
      return prisma.link.update({ where: { id: existing.id }, data: { icon: input.icon } });
    }
    return existing;
  }

  return prisma.link.create({
    data: {
      userId: null,
      categoryId: input.categoryId,
      sortOrder: input.sortOrder,
      title: input.title,
      url: input.url,
      icon: input.icon ?? null,
      description: input.description ?? null,
    },
  });
}

/**
 * 设置公共分类和给公共的分类添加links
 * @param prisma - Prisma 客户端
 * @param folder - 文件夹
 * @param parentId - 父级 ID
 * @param sortOrder - 排序顺序
 */
async function seedFolder(prisma: PrismaClient, folder: InitFolderNode, parentId: number | null, sortOrder: number) {
  const category = await findOrCreatePublicCategory(prisma, { name: folder.title, parentId, sortOrder });

  const children = folder.children ?? [];
  let folderOrder = 0;
  let linkOrder = 0;

  for (const child of children) {
    if (!child || typeof child !== 'object') continue;

    if ((child as InitFolderNode).type === 'folder') {
      await seedFolder(prisma, child as InitFolderNode, category.id, folderOrder++);
      continue;
    }

    if ((child as InitLinkNode).type === 'link') {
      const link = child as InitLinkNode;
      const iconPath = await persistIcon(link.icon);
      await findOrCreatePublicLink(prisma, {
        categoryId: category.id,
        sortOrder: linkOrder++,
        title: link.title,
        url: link.url,
        icon: iconPath,
        description: link.description,
      });
    }
  }
}

/**
 * 设置默认的公共链接
 */
async function seedDefaultLinks() {
  loadEnv();
  const prisma = new PrismaClient();
  try {
    const data = await loadInitJson();
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      if (!node || typeof node !== 'object' || node.type !== 'folder') continue;
      await seedFolder(prisma, node, null, i);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void seedDefaultLinks();
