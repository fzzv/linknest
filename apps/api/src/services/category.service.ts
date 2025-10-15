import { Insertable } from "kysely";
import { Injectable } from "@nestjs/common";
import { Category, CategoryRepository } from "@linknest/api";

@Injectable()
export class CategoryService {

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(category: Insertable<Category>) {
    return await this.categoryRepository.create(category);
  }

  async getAllCategories() {
    return await this.categoryRepository.getAllCategories();
  }

  async deleteCategory(id: string | number) {
    return await this.categoryRepository.deleteCategory(id);
  }
}
