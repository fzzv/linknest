import { PrismaService, type Link } from '@linknest/db';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLinkDto, UpdateLinkDto } from 'src/dtos';

@Injectable()
export class LinkService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number, categoryId?: number) {
    return this.prisma.link.findMany({
      where: {
        userId,
        ...(categoryId ? { categoryId } : {}),
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
}
