import { Injectable } from "@nestjs/common";
import { UserRepository, DB } from "@linknest/api";
import { Insertable } from "kysely";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(user: Insertable<DB['user']>) {
    await this.userRepository.createUser(user);
  }

  async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }
}
