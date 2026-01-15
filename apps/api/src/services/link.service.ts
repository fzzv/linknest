import { PrismaService, type Link } from '@linknest/db';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateLinkDto, UpdateLinkDto, LikeResponseDto } from 'src/dtos';

@Injectable()
export class LinkService {
  constructor(private readonly prisma: PrismaService) { }

  async list(userId: number, categoryId?: number) {
    return this.prisma.link.findMany({
      where: {
        userId,
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async listPublic(categoryId?: number) {
    if (categoryId) {
      await this.ensurePublicCategory(categoryId);
    }

    return this.prisma.link.findMany({
      where: {
        userId: null,
        ...(categoryId ? { categoryId } : {}),
        category: { userId: null, isPublic: true },
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async search(userId: number, keyword: string, categoryId?: number) {
    return this.prisma.link.findMany({
      where: {
        userId,
        ...(categoryId ? { categoryId } : {}),
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async searchPublic(keyword: string, categoryId?: number) {
    if (categoryId) {
      await this.ensurePublicCategory(categoryId);
    }

    return this.prisma.link.findMany({
      where: {
        userId: null,
        ...(categoryId ? { categoryId } : {}),
        category: { userId: null, isPublic: true },
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async getById(id: number, userId: number) {
    return this.ensureOwnedLink(id, userId);
  }

  async create(userId: number, dto: CreateLinkDto) {
    await this.ensureOwnedCategory(dto.categoryId, userId);
    return this.prisma.link.create({
      data: {
        title: dto.title,
        url: dto.url,
        description: dto.description ?? null,
        icon: dto.icon ?? null,
        cover: dto.cover ?? null,
        sortOrder: dto.sortOrder ?? 0,
        categoryId: dto.categoryId,
        userId,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateLinkDto) {
    await this.ensureOwnedLink(id, userId);
    if (dto.categoryId) {
      await this.ensureOwnedCategory(dto.categoryId, userId);
    }
    return this.prisma.link.update({
      where: { id },
      data: {
        title: dto.title,
        url: dto.url,
        description: dto.description,
        icon: dto.icon,
        cover: dto.cover,
        sortOrder: dto.sortOrder,
        categoryId: dto.categoryId,
        isPublic: dto.isPublic,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.ensureOwnedLink(id, userId);
    await this.prisma.link.delete({ where: { id } });
    return { message: 'Link deleted' };
  }

  private async ensureOwnedLink(id: number, userId: number): Promise<Link> {
    const link = await this.prisma.link.findFirst({ where: { id, userId } });
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    return link;
  }

  private async ensureOwnedCategory(id: number, userId: number) {
    const category = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  private async ensurePublicCategory(id: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId: null, isPublic: true },
    });
    if (!category) {
      throw new NotFoundException('Public category not found');
    }
    return category;
  }

  /**
   * 确保链接是公开的
   */
  private async ensurePublicLink(id: number): Promise<Link> {
    const link = await this.prisma.link.findFirst({
      where: { id, isPublic: true },
    });
    if (!link) {
      throw new NotFoundException('Public link not found');
    }
    return link;
  }

  /**
   * 点赞链接
   */
  async likeLink(linkId: number, userId: number): Promise<LikeResponseDto> {
    const link = await this.ensurePublicLink(linkId);

    // 检查是否已点赞
    const existing = await this.prisma.linkLike.findUnique({
      where: {
        userId_linkId: { userId, linkId },
      },
    });

    if (existing) {
      throw new ConflictException('Already liked');
    }

    // 使用事务同时创建点赞记录和增加计数
    await this.prisma.$transaction([
      this.prisma.linkLike.create({
        data: { userId, linkId },
      }),
      this.prisma.link.update({
        where: { id: linkId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    return {
      liked: true,
      likeCount: link.likeCount + 1,
    };
  }

  /**
   * 取消点赞
   */
  async unlikeLink(linkId: number, userId: number): Promise<LikeResponseDto> {
    const link = await this.ensurePublicLink(linkId);

    // 检查是否已点赞
    const existing = await this.prisma.linkLike.findUnique({
      where: {
        userId_linkId: { userId, linkId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Like not found');
    }

    // 使用事务同时删除点赞记录和减少计数
    await this.prisma.$transaction([
      this.prisma.linkLike.delete({
        where: { id: existing.id },
      }),
      this.prisma.link.update({
        where: { id: linkId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);

    return {
      liked: false,
      likeCount: Math.max(0, link.likeCount - 1),
    };
  }

  /**
   * 增加浏览量
   */
  async incrementViewCount(linkId: number): Promise<{ message: string }> {
    await this.ensurePublicLink(linkId);

    await this.prisma.link.update({
      where: { id: linkId },
      data: { viewCount: { increment: 1 } },
    });

    return { message: 'View count incremented' };
  }
}
