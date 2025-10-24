import { Injectable } from "@nestjs/common";
import { CreateUserDto, mapUser, UserResponseDto } from "@linknest/api";
import { BaseService } from "./base.service";

@Injectable()
export class UserService extends BaseService {

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.createUser(dto);
    return mapUser(user);
  }

  async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }
}
