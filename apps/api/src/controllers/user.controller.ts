import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AuthResponseDto,
  LoginDto,
  MessageResponseDto,
  RefreshTokenDto,
  RegisterResponseDto,
  RegisterUserDto,
  ResetPasswordDto,
  SendVerificationCodeDto,
  UpdateUserDto,
  UserDto
} from "src/dtos";
import { PublicApi } from "src/decorators/public-api.decorator";
import { CurrentUser } from "src/decorators/current-user.decorator";
import { UserService } from "src/services/user.service";

@ApiTags('用户')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiOkResponse({ description: '用户列表', type: UserDto, isArray: true })
  async getUsers() {
    return this.userService.getUsers();
  }

  @Post('send-code')
  @ApiOperation({ summary: '发送邮箱验证码' })
  @ApiBody({ type: SendVerificationCodeDto })
  @ApiCreatedResponse({ description: '验证码发送成功', type: MessageResponseDto })
  @PublicApi()
  sendVerificationCode(@Body() dto: SendVerificationCodeDto) {
    return this.userService.sendVerificationCode(dto);
  }

  @Post('register')
  @ApiOperation({ summary: '邮箱注册' })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({ description: '注册成功', type: RegisterResponseDto })
  @PublicApi()
  register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }

  @Post('reset-password/code')
  @ApiOperation({ summary: '发送重置密码验证码' })
  @ApiBody({ type: SendVerificationCodeDto })
  @ApiCreatedResponse({ description: '验证码发送成功', type: MessageResponseDto })
  @PublicApi()
  sendResetPasswordCode(@Body() dto: SendVerificationCodeDto) {
    return this.userService.sendResetPasswordCode(dto);
  }

  @Patch('reset-password')
  @ApiOperation({ summary: '重置密码' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: '重置成功', type: MessageResponseDto })
  @PublicApi()
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '邮箱+密码登录' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: '登录成功', type: AuthResponseDto })
  @PublicApi()
  login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新 AccessToken/RefreshToken' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: '刷新成功', type: AuthResponseDto })
  @PublicApi()
  refresh(@Body() dto: RefreshTokenDto) {
    return this.userService.refreshTokens(dto);
  }

  @Patch('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiOkResponse({ description: '更新成功', type: UserDto })
  @ApiBearerAuth()
  updateProfile(@Body() dto: UpdateUserDto, @CurrentUser('userId') userId: number) {
    return this.userService.updateProfile(userId, dto);
  }
}
