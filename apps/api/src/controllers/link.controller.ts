import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateLinkDto, LinkDto, MessageResponseDto, UpdateLinkDto } from 'src/dtos';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { PublicApi } from 'src/decorators/public-api.decorator';
import { LinkService } from 'src/services/link.service';

@ApiTags('链接')
@ApiBearerAuth()
@Controller('links')
export class LinkController {
  constructor(private readonly linkService: LinkService) { }

  @Get()
  @ApiOperation({ summary: '获取链接列表' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: '按分类筛选' })
  @ApiOkResponse({ type: LinkDto, isArray: true })
  getLinks(@CurrentUser('userId') userId: number, @Query('categoryId') categoryId?: string) {
    const parsedCategoryId = categoryId ? Number(categoryId) : undefined;
    if (categoryId && Number.isNaN(parsedCategoryId)) {
      throw new BadRequestException('categoryId must be a number');
    }
    return this.linkService.list(userId, parsedCategoryId);
  }

  @Get('/public')
  @PublicApi()
  @ApiOperation({ summary: '获取公开链接列表（默认分类）' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: '按公开分类筛选' })
  @ApiOkResponse({ type: LinkDto, isArray: true })
  getPublicLinks(@Query('categoryId') categoryId?: string) {
    const parsedCategoryId = categoryId ? Number(categoryId) : undefined;
    if (categoryId && Number.isNaN(parsedCategoryId)) {
      throw new BadRequestException('categoryId must be a number');
    }
    return this.linkService.listPublic(parsedCategoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个链接' })
  @ApiOkResponse({ type: LinkDto })
  getLink(@Param('id', ParseIntPipe) id: number, @CurrentUser('userId') userId: number) {
    return this.linkService.getById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: '创建链接' })
  @ApiCreatedResponse({ type: LinkDto })
  createLink(@Body() dto: CreateLinkDto, @CurrentUser('userId') userId: number) {
    return this.linkService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新链接' })
  @ApiOkResponse({ type: LinkDto })
  updateLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLinkDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.linkService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除链接' })
  @ApiOkResponse({ description: '删除成功', type: MessageResponseDto })
  deleteLink(@Param('id', ParseIntPipe) id: number, @CurrentUser('userId') userId: number) {
    return this.linkService.remove(id, userId);
  }
}
