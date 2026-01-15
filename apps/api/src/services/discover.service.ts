import { PrismaService } from '@linknest/db';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  FeaturedCategoryDto,
  FeaturedLinkDto,
  PublicLinkDto,
  CategoryDetailDto,
} from 'src/dtos';

@Injectable()
export class DiscoverService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取精选分类（按热度排序）
   * 热度 = 分类下链接的总互动量（viewCount + likeCount * 2）
   */
  async getFeaturedCategories(limit: number = 12): Promise<FeaturedCategoryDto[]> {
    // 获取所有公开分类及其公开链接的统计
    const categories = await this.prisma.category.findMany({
      where: {
        isPublic: true,
        links: {
          some: { isPublic: true },
        },
      },
      include: {
        _count: {
          select: {
            links: {
              where: { isPublic: true },
            },
          },
        },
        links: {
          where: { isPublic: true },
          select: {
            viewCount: true,
            likeCount: true,
          },
        },
      },
    });

    // 计算每个分类的热度分数并排序
    const scored = categories.map((cat) => {
      const engagement = cat.links.reduce(
        (sum, link) => sum + link.viewCount + link.likeCount * 2,
        0,
      );
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        linkCount: cat._count.links,
        engagement,
      };
    });

    return scored
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit)
      .map(({ engagement, ...rest }) => rest);
  }

  /**
   * 获取本周热门链接
   * 按 likeCount -> viewCount -> createdAt 降序排列
   */
  async getFeaturedLinks(
    limit: number = 10,
    userId?: number,
  ): Promise<FeaturedLinkDto[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const links = await this.prisma.link.findMany({
      where: {
        isPublic: true,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: [
        { likeCount: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: userId
        ? {
            linkLikes: {
              where: { userId },
              select: { id: true },
            },
          }
        : undefined,
    });

    return links.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      icon: link.icon,
      viewCount: link.viewCount,
      likeCount: link.likeCount,
      isLiked: userId ? (link as any).linkLikes?.length > 0 : false,
    }));
  }

  /**
   * 获取最近公开的链接
   */
  async getRecentPublicLinks(
    limit: number = 20,
    offset: number = 0,
    userId?: number,
  ): Promise<PublicLinkDto[]> {
    const links = await this.prisma.link.findMany({
      where: {
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        ...(userId
          ? {
              linkLikes: {
                where: { userId },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    return links.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      icon: link.icon,
      viewCount: link.viewCount,
      likeCount: link.likeCount,
      isLiked: userId ? (link as any).linkLikes?.length > 0 : false,
      createdAt: link.createdAt,
      category: {
        id: link.category.id,
        name: link.category.name,
      },
    }));
  }

  /**
   * 获取分类详情及其链接
   */
  async getCategoryDetail(
    categoryId: number,
    sort: 'latest' | 'popular' | 'recommended' = 'recommended',
    limit: number = 20,
    offset: number = 0,
    userId?: number,
  ): Promise<CategoryDetailDto> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        isPublic: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // 根据排序方式构建 orderBy
    let orderBy: any[];
    switch (sort) {
      case 'latest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'popular':
        orderBy = [{ likeCount: 'desc' }, { viewCount: 'desc' }];
        break;
      case 'recommended':
      default:
        // 推荐算法：综合热度和新鲜度
        orderBy = [
          { likeCount: 'desc' },
          { viewCount: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
    }

    const [links, total] = await Promise.all([
      this.prisma.link.findMany({
        where: {
          categoryId,
          isPublic: true,
        },
        orderBy,
        take: limit,
        skip: offset,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          ...(userId
            ? {
                linkLikes: {
                  where: { userId },
                  select: { id: true },
                },
              }
            : {}),
        },
      }),
      this.prisma.link.count({
        where: {
          categoryId,
          isPublic: true,
        },
      }),
    ]);

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      links: links.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        icon: link.icon,
        viewCount: link.viewCount,
        likeCount: link.likeCount,
        isLiked: userId ? (link as any).linkLikes?.length > 0 : false,
        createdAt: link.createdAt,
        category: {
          id: link.category.id,
          name: link.category.name,
        },
      })),
      total,
    };
  }

  /**
   * 搜索公开内容
   */
  async searchPublicContent(
    keyword: string,
    limit: number = 20,
    offset: number = 0,
    userId?: number,
  ): Promise<PublicLinkDto[]> {
    const links = await this.prisma.link.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
      orderBy: [
        { likeCount: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        ...(userId
          ? {
              linkLikes: {
                where: { userId },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    return links.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      icon: link.icon,
      viewCount: link.viewCount,
      likeCount: link.likeCount,
      isLiked: userId ? (link as any).linkLikes?.length > 0 : false,
      createdAt: link.createdAt,
      category: {
        id: link.category.id,
        name: link.category.name,
      },
    }));
  }
}
