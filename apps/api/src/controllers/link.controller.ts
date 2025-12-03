import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateLinkDto, LinkDto, MessageResponseDto, UpdateLinkDto, UploadLinkIconResponseDto } from 'src/dtos';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { PublicApi } from 'src/decorators/public-api.decorator';
import { LinkIconService } from 'src/services/link-icon.service';
import { LinkService } from 'src/services/link.service';

@ApiTags('链接')
@ApiBearerAuth()
@Controller('links')
export class LinkController {
  constructor(
    private readonly linkService: LinkService,
    private readonly linkIconService: LinkIconService,
  ) { }

  @Get()
  @ApiOperation({ summary: '获取链接列表' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: '按分类筛选' })
  @ApiOkResponse({ type: LinkDto, isArray: true })
  getLinks(@CurrentUser('userId') userId: number, @Query('categoryId') categoryId?: string) {
    if (categoryId === undefined || categoryId === '') {
      return this.linkService.list(userId, undefined);
    }
  
    const parsed = Number(categoryId);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException('categoryId must be an integer');
    }
    return this.linkService.list(userId, parsed);
  }

  @Get('/public')
  @PublicApi()
  @ApiOperation({ summary: '获取公开链接列表（默认分类）' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: '按公开分类筛选' })
  @ApiOkResponse({ type: LinkDto, isArray: true })
  getPublicLinks(@Query('categoryId') categoryId?: string) {
    if (categoryId === undefined || categoryId === '') {
      return this.linkService.listPublic(undefined);
    }
  
    const parsed = Number(categoryId);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException('categoryId must be an integer');
    }
    return this.linkService.listPublic(parsed);
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

  @Post('upload-icon')
  @ApiOperation({ summary: '上传链接图标' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '上传链接图标文件',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: '图标文件（仅支持图片）' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: UploadLinkIconResponseDto })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadLinkIcon(@UploadedFile() file: Express.Multer.File) {
    return this.linkIconService.upload(file);
  }
}
