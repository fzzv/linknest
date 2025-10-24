import { Insertable, Kysely } from "kysely";
import { DB, UserTable } from "../schema/tables";
import { Injectable } from "@nestjs/common";
import { InjectKysely } from "nestjs-kysely";

@Injectable()
export class UserRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  async createUser(user: Insertable<UserTable>) {
    return await this.db.insertInto('user').values(user).returningAll().executeTakeFirstOrThrow();
  }

  async getAllUsers(){
    return await this.db.selectFrom('user').selectAll().execute();
  }
}
