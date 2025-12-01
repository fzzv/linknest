import { PrismaService, type Category, type Link } from '@linknest/db';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from 'src/dtos';

type CategoryWithCount = Category & { count: number };
type CategoryTreeNode = Category & { children: CategoryTreeNode[]; links: Link[]; count: number };

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 获取分类列表
   * @param userId 用户 ID
   * @returns 分类列表
   */
  async list(userId: number): Promise<CategoryWithCount[]> {
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
  async listTree(userId: number): Promise<CategoryTreeNode[]> {
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

  async listPublic(): Promise<CategoryWithCount[]> {
    const categories = await this.prisma.category.findMany({
      where: { isPublic: true, userId: null },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { links: true } } },
    });

    return categories.map(({ _count, ...category }) => ({
      ...category,
      count: _count.links,
    }));
  }

  async listPublicTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.prisma.category.findMany({
      where: { isPublic: true, userId: null },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        links: {
          where: { userId: null },
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
}
