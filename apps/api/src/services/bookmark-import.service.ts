import { PrismaService, Prisma } from '@linknest/db';
import { BadRequestException, Injectable } from '@nestjs/common';

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
  constructor(private readonly prisma: PrismaService) {}

  async importFromHtml(userId: number, html: string) {
    const nodes = this.parseHtml(html);
    if (!nodes.length) {
      throw new BadRequestException('未解析到书签内容');
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
          title: this.decodeHtml(h3Title?.trim() ?? '未命名分类'),
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
            name: node.title || '未命名分类',
            parentId: parentCategoryId,
            userId,
            sortOrder: node.addDate ?? 0,
            isPublic: false,
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
      await tx.link.create({
        data: {
          title: node.title || node.url,
          url: node.url,
          description: null,
          icon: node.icon ?? null,
          cover: null,
          sortOrder: node.addDate ?? 0,
          categoryId,
          userId,
        },
      });
      stats.links += 1;
    }
  }

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
      where: { userId, name: 'Imported Bookmarks', parentId: null },
    });
    if (existing) {
      ref.value = existing.id;
      return existing.id;
    }

    const category = await tx.category.create({
      data: { name: 'Imported Bookmarks', parentId: null, userId, sortOrder: 0, isPublic: false },
    });
    stats.categories += 1;
    ref.value = category.id;
    return category.id;
  }
}
