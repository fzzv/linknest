import { PrismaService, Prisma } from '@linknest/db';
import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { I18nService } from 'nestjs-i18n';

type BookmarkNode = FolderNode | LinkNode;

interface FolderNode {
  type: 'folder';
  title: string;
  addDate?: number;
  lastModified?: number;
  children: BookmarkNode[];
}

interface LinkNode {
  type: 'link';
  title: string;
  url: string;
  addDate?: number;
  icon?: string;
}

type Stats = { categories: number; links: number };

@Injectable()
export class BookmarkImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService
  ) { }

  async importFromHtml(userId: number, html: string) {
    const nodes = this.parseHtml(html);
    return this.importNodes(userId, nodes);
  }

  async importFromJson(userId: number, json: string) {
    const nodes = this.parseJson(json);
    return this.importNodes(userId, nodes);
  }

  private async importNodes(userId: number, nodes: BookmarkNode[]) {
    if (!nodes.length) {
      throw new BadRequestException(this.i18n.t('bookmark.noContent'));
    }

    const stats: Stats = { categories: 0, links: 0 };
    const fallbackCategoryRef: { value: number | null } = { value: null };

    // 使用事务处理书签导入
    await this.prisma.$transaction(async (tx) => {
      await this.persistNodes(tx, nodes, userId, null, stats, fallbackCategoryRef);
    });

    return { importedCategories: stats.categories, importedLinks: stats.links };
  }

  // 解析书签 HTML 内容
  private parseHtml(html: string): BookmarkNode[] {
    const tokenRegex =
      /<DL[^>]*>|<\/DL>|<DT><H3([^>]*)>(.*?)<\/H3>|<DT><A([^>]*)>(.*?)<\/A>/gis;

    const root: FolderNode = { type: 'folder', title: 'root', children: [] };
    const stack: FolderNode[] = [root];
    let lastFolder: FolderNode | null = null;

    for (const match of html.matchAll(tokenRegex)) {
      const [token, h3Attrs, h3Title, aAttrs, aTitle] = match;

      if (token.startsWith('<DL')) {
        if (lastFolder) {
          stack.push(lastFolder);
          lastFolder = null;
        }
        continue;
      }

      if (token.startsWith('</DL')) {
        if (stack.length > 1) {
          stack.pop();
        }
        lastFolder = null;
        continue;
      }

      if (token.startsWith('<DT><H3')) {
        const attrs = this.parseAttributes(h3Attrs ?? '');
        const folder: FolderNode = {
          type: 'folder',
          title: this.decodeHtml(h3Title?.trim() ?? this.i18n.t('bookmark.unnamedCategory')),
          addDate: attrs.ADD_DATE ? Number(attrs.ADD_DATE) : undefined,
          lastModified: attrs.LAST_MODIFIED ? Number(attrs.LAST_MODIFIED) : undefined,
          children: [],
        };
        stack[stack.length - 1].children.push(folder);
        lastFolder = folder;
        continue;
      }

      if (token.startsWith('<DT><A')) {
        const attrs = this.parseAttributes(aAttrs ?? '');
        const url = attrs.HREF;
        if (!url) {
          continue;
        }
        const link: LinkNode = {
          type: 'link',
          title: this.decodeHtml(aTitle?.trim() ?? url),
          url,
          addDate: attrs.ADD_DATE ? Number(attrs.ADD_DATE) : undefined,
          icon: attrs.ICON,
        };
        stack[stack.length - 1].children.push(link);
        lastFolder = null;
      }
    }

    return root.children;
  }

  private parseJson(json: string): BookmarkNode[] {
    let payload: unknown;
    try {
      payload = JSON.parse(json);
    } catch (error) {
      throw new BadRequestException(this.i18n.t('bookmark.jsonParseError'));
    }

    const rootNodes = this.getRootNodes(payload);
    return rootNodes.map((node, index) => this.normalizeJsonNode(node, `root[${index}]`));
  }

  private getRootNodes(payload: unknown) {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && typeof payload === 'object' && Array.isArray((payload as Record<string, unknown>).children)) {
      return (payload as Record<string, unknown>).children as unknown[];
    }
    throw new BadRequestException(this.i18n.t('bookmark.invalidFormat'));
  }

  private normalizeJsonNode(input: unknown, path: string): BookmarkNode {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException(this.i18n.t('bookmark.invalidObject', { args: { path } }));
    }

    const node = input as Record<string, unknown>;
    if (node.type === 'folder') {
      const childrenInput = Array.isArray(node.children) ? node.children : [];
      return {
        type: 'folder',
        title: this.normalizeTitle(node.title, this.i18n.t('bookmark.unnamedCategory')),
        addDate: this.normalizeTimestamp(node.addDate),
        lastModified: this.normalizeTimestamp(node.lastModified),
        children: childrenInput.map((child, index) =>
          this.normalizeJsonNode(child, `${path}.children[${index}]`),
        ),
      };
    }

    if (node.type === 'link') {
      const url = this.normalizeUrl(node.url, path);
      return {
        type: 'link',
        title: this.normalizeTitle(node.title ?? url, url),
        url,
        addDate: this.normalizeTimestamp(node.addDate),
        icon: typeof node.icon === 'string' ? node.icon : undefined,
      };
    }

    throw new BadRequestException(this.i18n.t('bookmark.missingType', { args: { path } }));
  }

  private normalizeTitle(value: unknown, fallback: string) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    return fallback;
  }

  private normalizeTimestamp(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const num = Number(value);
      if (Number.isFinite(num)) {
        return num;
      }
    }
    return undefined;
  }

  private normalizeUrl(value: unknown, path: string) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    throw new BadRequestException(this.i18n.t('bookmark.missingUrl', { args: { path } }));
  }

  private parseAttributes(raw: string) {
    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
    for (const match of raw.matchAll(attrRegex)) {
      attrs[match[1].toUpperCase()] = match[2];
    }
    return attrs;
  }

  private decodeHtml(value: string) {
    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  /**
   * 持久化书签节点
   * @param tx Prisma 事务客户端
   * @param nodes 书签节点
   * @param userId 用户 ID
   * @param parentCategoryId 父分类 ID
   * @param stats 统计信息
   * @param fallbackCategoryRef 回退分类引用
   */
  private async persistNodes(
    tx: Prisma.TransactionClient,
    nodes: BookmarkNode[],
    userId: number,
    parentCategoryId: number | null,
    stats: Stats,
    fallbackCategoryRef: { value: number | null },
  ) {
    for (const node of nodes) {
      if (node.type === 'folder') {
        const category = await tx.category.create({
          data: {
            name: node.title || this.i18n.t('bookmark.unnamedCategory'),
            parentId: parentCategoryId,
            userId,
            sortOrder: node.addDate ?? 0,
            isPublic: false,
            icon: 'Bookmark',
          },
        });
        stats.categories += 1;
        await this.persistNodes(tx, node.children, userId, category.id, stats, fallbackCategoryRef);
        continue;
      }

      let categoryId = parentCategoryId;
      if (!categoryId) {
        categoryId = await this.getOrCreateFallbackCategory(tx, userId, fallbackCategoryRef, stats);
      }
      const iconPath = await this.saveIconIfNeeded(node.icon);
      await tx.link.create({
        data: {
          title: node.title || node.url,
          url: node.url,
          description: null,
          icon: iconPath,
          cover: null,
          sortOrder: node.addDate ?? 0,
          categoryId,
          userId,
        },
      });
      stats.links += 1;
    }
  }

  /**
   * 获取或创建回退分类
   * @param tx Prisma 事务客户端
   * @param userId 用户 ID
   * @param ref 回退分类引用
   * @param stats 统计信息
   * @returns 回退分类 ID
   */
  private async getOrCreateFallbackCategory(
    tx: Prisma.TransactionClient,
    userId: number,
    ref: { value: number | null },
    stats: Stats,
  ) {
    if (ref.value) {
      return ref.value;
    }

    const existing = await tx.category.findFirst({
      where: { userId, name: this.i18n.t('bookmark.defaultFolderName'), parentId: null },
    });
    if (existing) {
      ref.value = existing.id;
      return existing.id;
    }

    const category = await tx.category.create({
      data: {
        name: this.i18n.t('bookmark.defaultFolderName'),
        parentId: null,
        userId,
        sortOrder: 0,
        isPublic: false,
        icon: 'Bookmark',
      },
    });
    stats.categories += 1;
    ref.value = category.id;
    return category.id;
  }

  /**
   * 将书签的图标保存到本地 uploads/linkicons 文件夹下
   * @param icon 
   * @returns 保存后的文件路径
   */
  private async saveIconIfNeeded(icon?: string): Promise<string | null> {
    if (!icon) {
      return null;
    }

    const trimmedIcon = icon.trim();
    if (!trimmedIcon) {
      return null;
    }

    // 判断是否为 Data URL
    const base64Marker = ';base64,';
    const markerIndex = trimmedIcon.indexOf(base64Marker);
    const isDataUrl = trimmedIcon.startsWith('data:') && markerIndex > 'data:'.length;
    if (!isDataUrl) {
      return trimmedIcon;
    }

    // 清理头部，获取 MIME 类型和数据
    const meta = trimmedIcon.slice('data:'.length, markerIndex);
    const data = trimmedIcon.slice(markerIndex + base64Marker.length);
    const mime = meta.split(';')[0];
    if (!mime || !data) {
      return trimmedIcon;
    }
    // 将 Base64 数据转换为 Buffer
    const buffer = Buffer.from(data, 'base64');
    // 计算 MD5 哈希值
    const hash = createHash('md5').update(buffer).digest('hex');
    const filename = `${hash}.${this.getExtensionFromMime(mime)}`;
    // 图标保存目录
    const dir = this.getIconDir();
    // recursive: true 表示如果目录不存在，则创建目录
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, filename);
    try {
      // flag: 'wx' 表示如果文件存在，则抛出错误
      await writeFile(filePath, buffer, { flag: 'wx' });
    } catch (error) {
      const writeError = error as NodeJS.ErrnoException;
      if (writeError.code !== 'EEXIST') {
        throw error;
      }
    }

    return posix.join('/uploads', 'linkicons', filename);
  }

  private getIconDir() {
    return join(__dirname, '..', '..', 'uploads', 'linkicons');
  }

  /**
   * 根据 MIME 类型获取文件扩展名
   * @param mime MIME 类型
   * @returns 文件扩展名
   */
  private getExtensionFromMime(mime: string) {
    const normalized = mime.toLowerCase();
    const mimeMap: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/x-icon': 'ico',
      'image/vnd.microsoft.icon': 'ico',
      'image/webp': 'webp',
    };
    return mimeMap[normalized] ?? 'png';
  }
}
