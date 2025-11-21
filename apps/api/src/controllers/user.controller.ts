import { Body, Controller, Get, Post } from "@nestjs/common";
import { LoginDto, RefreshTokenDto, RegisterUserDto, SendVerificationCodeDto } from "src/dtos";
import { UserService } from "src/services/user.service";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }

  @Post('send-code')
  sendVerificationCode(@Body() dto: SendVerificationCodeDto) {
    return this.userService.sendVerificationCode(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.userService.refreshTokens(dto);
  }
}
