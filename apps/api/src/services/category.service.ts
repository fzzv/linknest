import { Injectable } from "@nestjs/common";
import { Insertable } from "kysely";
import { CategoryTable } from "@linknest/api";
import { BaseService } from "./base.service";

@Injectable()
export class CategoryService extends BaseService {

  async createCategory(category: Insertable<CategoryTable>) {
    return await this.categoryRepository.create(category);
  }

  async getAllCategories() {
    return await this.categoryRepository.getAllCategories();
  }

  async deleteCategory(id: string) {
    return await this.categoryRepository.deleteCategory(id);
  }
}
