import { Controller, Post, Body, Get } from "@nestjs/common";
import { UserService } from "src/services/user.service";
import { CreateUserDto } from "@linknest/api";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }
}
