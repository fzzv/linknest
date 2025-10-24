import { Injectable } from "@nestjs/common";
import { InjectKysely } from "nestjs-kysely";
import { Kysely } from "kysely";
import { CategoryTable, DB } from "../schema/tables";
import { Insertable } from "kysely";

@Injectable()
export class CategoryRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  create(category: Insertable<CategoryTable>) {
    return this.db.insertInto('category').values(category).returningAll().executeTakeFirstOrThrow();
  }

  async getAllCategories() {
    return await this.db
      .selectFrom('category')
      .selectAll()
      .orderBy('created_at', 'asc')
      .execute();
  }

  async deleteCategory(id: string) {
    console.log(await this.db.deleteFrom('category').where('id', '=', id).executeTakeFirst())
    return await this.db.deleteFrom('category').where('id', '=', id).execute();
  }
}
