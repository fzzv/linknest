import { PrismaService, type Category, type Link } from '@linknest/db';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from 'src/dtos';

type CategoryWithCount = Category & { count: number };
type CategoryTreeNode = Category & { children: CategoryTreeNode[]; links: Link[]; count: number };
type DefaultCategorySeed = {
  name: string;
  sortOrder: number;
  links: { title: string; url: string; sortOrder: number }[];
};

const DEFAULT_PUBLIC_USER_ID = 0;
const DEFAULT_CATEGORIES: DefaultCategorySeed[] = [
  {
    name: '常用工具',
    sortOrder: 1,
    links: [
      { title: 'Google', url: 'https://www.google.com', sortOrder: 1 },
      { title: 'GitHub', url: 'https://github.com', sortOrder: 2 },
    ],
  },
  {
    name: '开发资源',
    sortOrder: 2,
    links: [
      { title: 'Prisma 文档', url: 'https://www.prisma.io/docs', sortOrder: 1 },
      { title: 'NestJS', url: 'https://nestjs.com', sortOrder: 2 },
    ],
  },
];

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取分类列表
   * @param userId 用户 ID
   * @returns 分类列表
   */
  async list(userId?: number): Promise<CategoryWithCount[]> {
    if (!userId) {
      return this.buildDefaultCategories().map(({ children: _children, links, ...category }) => category);
    }

    const categories = await this.prisma.category.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { links: true } } },
    });

    return categories.map(({ _count, ...category }) => ({
      ...category,
      count: _count.links,
    }));
  }

  /**
   * 获取分类树
   * @param userId 用户 ID
   * @returns 分类树
   */
  async listTree(userId?: number): Promise<CategoryTreeNode[]> {
    if (!userId) {
      return this.buildDefaultCategories();
    }

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

    const map = new Map<number, CategoryTreeNode>();
    categories.forEach((category) => {
      map.set(category.id, { ...category, children: [], count: category.links.length });
    });

    const roots: CategoryTreeNode[] = [];
    map.forEach((category) => {
      if (category.parentId && map.has(category.parentId)) {
        map.get(category.parentId)!.children.push(category);
      } else {
        roots.push(category);
      }
    });

    return roots;
  }

  async getById(id: number, userId: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
      include: { _count: { select: { links: true } } },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.mapWithCount(category);
  }

  async create(userId: number, dto: CreateCategoryDto) {
    if (dto.parentId) {
      await this.ensureOwnedCategory(dto.parentId, userId);
    }
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
        isPublic: dto.isPublic ?? false,
        parentId: dto.parentId ?? null,
        userId,
      },
    });

    return { ...category, count: 0 };
  }

  async update(id: number, userId: number, dto: UpdateCategoryDto) {
    await this.ensureOwnedCategory(id, userId);

    let parentId = dto.parentId;
    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      if (dto.parentId) {
        await this.ensureOwnedCategory(dto.parentId, userId);
      } else {
        parentId = null;
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        sortOrder: dto.sortOrder,
        isPublic: dto.isPublic,
        parentId,
      },
      include: { _count: { select: { links: true } } },
    }).then((category) => this.mapWithCount(category));
  }

  async remove(id: number, userId: number) {
    await this.ensureOwnedCategory(id, userId);
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted' };
  }

  private async ensureOwnedCategory(id: number, userId: number) {
    const category = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  private mapWithCount(category: Category & { _count: { links: number } }): CategoryWithCount {
    const { _count, ...rest } = category;
    return { ...rest, count: _count.links };
  }

  /**
   * 返回未登录用户的默认分类（使用负数 ID 与公共 userId 区分真实数据）
   */
  private buildDefaultCategories(): CategoryTreeNode[] {
    const timestamp = new Date(0);
    return DEFAULT_CATEGORIES.map((category, categoryIndex) => {
      const categoryId = -(categoryIndex + 1);
      const links: Link[] = category.links.map((link, linkIndex) => ({
        id: categoryId * 1000 - (linkIndex + 1),
        title: link.title,
        url: link.url,
        description: null,
        icon: null,
        cover: null,
        sortOrder: link.sortOrder,
        categoryId,
        userId: DEFAULT_PUBLIC_USER_ID,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      return {
        id: categoryId,
        name: category.name,
        sortOrder: category.sortOrder,
        isPublic: true,
        icon: null,
        parentId: null,
        userId: DEFAULT_PUBLIC_USER_ID,
        createdAt: timestamp,
        updatedAt: timestamp,
        children: [],
        links,
        count: links.length,
      };
    });
  }
}
