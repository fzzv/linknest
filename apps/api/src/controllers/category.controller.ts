import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CategoryDto, CategoryTreeDto, CreateCategoryDto, MessageResponseDto, UpdateCategoryDto } from 'src/dtos';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { PublicApi } from 'src/decorators/public-api.decorator';
import { CategoryService } from 'src/services/category.service';

@ApiTags('分类')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @PublicApi()
  @ApiOperation({ summary: '获取分类列表' })
  @ApiOkResponse({ type: CategoryDto, isArray: true })
  getCategories(@CurrentUser('userId') userId?: number) {
    return this.categoryService.list(userId);
  }

  @Get('/tree')
  @PublicApi()
  @ApiOperation({ summary: '获取分类树（包含子分类与链接）' })
  @ApiOkResponse({ type: CategoryTreeDto, isArray: true })
  getCategoriesTree(@CurrentUser('userId') userId?: number) {
    return this.categoryService.listTree(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个分类' })
  @ApiOkResponse({ type: CategoryDto })
  getCategory(@Param('id', ParseIntPipe) id: number, @CurrentUser('userId') userId: number) {
    return this.categoryService.getById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: '创建分类' })
  @ApiCreatedResponse({ type: CategoryDto })
  createCategory(@Body() dto: CreateCategoryDto, @CurrentUser('userId') userId: number) {
    return this.categoryService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新分类' })
  @ApiOkResponse({ type: CategoryDto })
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.categoryService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  @ApiOkResponse({ description: '删除成功', type: MessageResponseDto })
  deleteCategory(@Param('id', ParseIntPipe) id: number, @CurrentUser('userId') userId: number) {
    return this.categoryService.remove(id, userId);
  }
}
