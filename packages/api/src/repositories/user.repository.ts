import { Insertable, Kysely } from "kysely";
import { DB, User } from "../schema/tables";
import { Injectable } from "@nestjs/common";
import { InjectKysely } from "nestjs-kysely";

@Injectable()
export class UserRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  async createUser(user: Insertable<User>) {
    return await this.db.insertInto('user').values(user).execute();
  }

  async getAllUsers(){
    return await this.db.selectFrom('user').selectAll().execute();
  }
}
