import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PublicApi } from 'src/decorators/public-api.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { DiscoverService } from 'src/services/discover.service';
import {
  CategoryDetailDto,
  CategoryDetailQueryDto,
  FeaturedCategoryDto,
  FeaturedLinkDto,
  FeaturedLinksQueryDto,
  PaginationQueryDto,
  PublicLinkDto,
  SearchQueryDto,
} from 'src/dtos';

@ApiTags('发现')
@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get('featured-categories')
  @PublicApi()
  @ApiOperation({ summary: '获取精选分类（首页用）' })
  @ApiOkResponse({ type: FeaturedCategoryDto, isArray: true })
  getFeaturedCategories(): Promise<FeaturedCategoryDto[]> {
    return this.discoverService.getFeaturedCategories(12);
  }

  @Get('featured-links')
  @PublicApi()
  @ApiOperation({ summary: '获取本周热门链接' })
  @ApiOkResponse({ type: FeaturedLinkDto, isArray: true })
  getFeaturedLinks(
    @Query() query: FeaturedLinksQueryDto,
    @CurrentUser('userId') userId?: number,
  ): Promise<FeaturedLinkDto[]> {
    return this.discoverService.getFeaturedLinks(query.limit ?? 10, userId);
  }

  @Get('recent-public')
  @PublicApi()
  @ApiOperation({ summary: '获取最近公开的链接' })
  @ApiOkResponse({ type: PublicLinkDto, isArray: true })
  getRecentPublicLinks(
    @Query() query: PaginationQueryDto,
    @CurrentUser('userId') userId?: number,
  ): Promise<PublicLinkDto[]> {
    return this.discoverService.getRecentPublicLinks(
      query.limit ?? 20,
      query.offset ?? 0,
      userId,
    );
  }

  @Get('category/:id')
  @PublicApi()
  @ApiOperation({ summary: '获取分类详情及其链接' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: CategoryDetailDto })
  getCategoryDetail(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: CategoryDetailQueryDto,
    @CurrentUser('userId') userId?: number,
  ): Promise<CategoryDetailDto> {
    return this.discoverService.getCategoryDetail(
      id,
      query.sort ?? 'recommended',
      query.limit ?? 20,
      query.offset ?? 0,
      userId,
    );
  }

  @Get('search')
  @PublicApi()
  @ApiOperation({ summary: '搜索公开内容' })
  @ApiOkResponse({ type: PublicLinkDto, isArray: true })
  searchPublicContent(
    @Query() query: SearchQueryDto,
    @CurrentUser('userId') userId?: number,
  ): Promise<PublicLinkDto[]> {
    return this.discoverService.searchPublicContent(
      query.q,
      query.limit ?? 20,
      query.offset ?? 0,
      userId,
    );
  }
}
