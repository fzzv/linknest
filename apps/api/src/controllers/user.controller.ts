import { Controller, Get } from "@nestjs/common";
import { UserService } from "src/services/user.service";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }
}
