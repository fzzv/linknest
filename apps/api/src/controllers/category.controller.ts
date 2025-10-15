import { Post, Body, Controller, Get, Param, Delete } from "@nestjs/common";
import { CategoryService } from "src/services/category.service";
import { CreateCategoryDto } from "@linknest/api";

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Get()
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string | number) {
    return this.categoryService.deleteCategory(id);
  }
}
