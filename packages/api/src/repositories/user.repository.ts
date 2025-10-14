import { Insertable, Kysely } from "kysely";
import { DB } from "../schema";
import { UserTable } from "../schema/tables/user.table";
import { Injectable } from "@nestjs/common";
import { InjectKysely } from "nestjs-kysely";

@Injectable()
export class UserRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  async createUser(user: Insertable<UserTable>) {
    return await this.db.insertInto('user').values(user).execute();
  }

  async getAllUsers(){
    return await this.db.selectFrom('user').selectAll().execute();
  }
}
