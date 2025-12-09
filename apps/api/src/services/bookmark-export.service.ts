import { PrismaService, type Category, type Link } from '@linknest/db';
import { Injectable } from '@nestjs/common';
import { toEpoch, escapeHtml, escapeAttr, iconToDataUrl, buildFilename } from 'src/utils/export.util';

type CategoryNode = Category & { children: CategoryNode[]; links: Link[] };

@Injectable()
export class BookmarkExportService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 导出书签 HTML 文件
   * @param userId 用户 ID
   * @returns 书签 HTML 文件内容和文件名
   */
  async exportToHtml(userId: number) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        links: {
          where: { userId },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        },
      },
    });

    const tree = this.buildTree(categories);
    await this.populateIcons(tree);
    const now = Date.now();
    const filename = buildFilename(now);
    const html = this.renderHtml(tree, now);

    return { filename, content: html };
  }

  /**
   * 构建书签分类树
   * @param categories 书签分类列表
   * @returns 书签分类树
   */
  private buildTree(categories: (Category & { links: Link[] })[]): CategoryNode[] {
    const nodes = categories.map<CategoryNode>((category) => ({
      ...category,
      children: [],
      links: category.links,
    }));
    const map = new Map<number, CategoryNode>();
    nodes.forEach((node) => map.set(node.id, node));

    const roots: CategoryNode[] = [];
    nodes.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * 渲染书签分类树为 HTML 字符串
   * @param tree 书签分类树
   * @param timestamp 时间戳
   * @returns HTML 字符串
   */
  private renderHtml(tree: CategoryNode[], timestamp: number) {
    const lines: string[] = [];
    const indent = (level: number) => '    '.repeat(level);
    const rootTitle = '书签栏';

    lines.push('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
    lines.push('<!-- This is an automatically generated file.');
    lines.push('     It will be read and overwritten.');
    lines.push('     DO NOT EDIT! -->');
    lines.push('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">');
    lines.push('<TITLE>Bookmarks</TITLE>');
    lines.push('<H1>Bookmarks</H1>');
    lines.push('<DL><p>');
    lines.push(
      `${indent(1)}<DT><H3 ADD_DATE="${toEpoch(timestamp)}" LAST_MODIFIED="${toEpoch(timestamp)}" PERSONAL_TOOLBAR_FOLDER="true">${escapeHtml(rootTitle)}</H3>`,
    );
    lines.push(`${indent(1)}<DL><p>`);

    for (const category of tree) {
      this.renderCategory(lines, category, 2);
    }

    lines.push(`${indent(1)}</DL><p>`);
    lines.push('</DL><p>');
    return lines.join('\n');
  }

  /**
   * 渲染书签分类为 HTML 字符串
   * @param lines 行数组
   * @param category 书签分类
   * @param depth 深度
   */
  private renderCategory(lines: string[], category: CategoryNode, depth: number) {
    const indent = '    '.repeat(depth);
    const addDate = toEpoch(category.createdAt);
    const lastModified = toEpoch(category.updatedAt ?? category.createdAt);
    lines.push(
      `${indent}<DT><H3 ADD_DATE="${addDate}" LAST_MODIFIED="${lastModified}">${escapeHtml(category.name)}</H3>`,
    );
    lines.push(`${indent}<DL><p>`);

    for (const link of category.links) {
      lines.push(this.renderLink(link, depth + 1));
    }

    for (const child of category.children) {
      this.renderCategory(lines, child, depth + 1);
    }

    lines.push(`${indent}</DL><p>`);
  }

  /**
   * 渲染书签为 HTML 字符串
   * @param link 书签
   * @param depth 深度
   * @returns HTML 字符串
   */
  private renderLink(link: Link, depth: number) {
    const indent = '    '.repeat(depth);
    const addDate = toEpoch(link.createdAt);
    const attrs = [`HREF="${escapeAttr(link.url)}"`, `ADD_DATE="${addDate}"`];
    if (link.icon) {
      attrs.push(`ICON="${escapeAttr(link.icon)}"`);
    }
    return `${indent}<DT><A ${attrs.join(' ')}>${escapeHtml(link.title)}</A>`;
  }

  /**
   * 填充书签图标
   * @param nodes 书签分类树
   */
  private async populateIcons(nodes: CategoryNode[]) {
    await Promise.all(
      nodes.map(async (node) => {
        node.links = await Promise.all(
          node.links.map(async (link) => ({
            ...link,
            icon: link.icon ? await iconToDataUrl(link.icon) : link.icon,
          })),
        );
        await this.populateIcons(node.children);
      }),
    );
  }
}
