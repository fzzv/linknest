import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'user@example.com', description: '注册邮箱' })
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  email!: string;

  @ApiProperty({ example: 'Passw0rd', minLength: 6, description: '登录密码' })
  @IsString({ message: '密码格式不正确' })
  @MinLength(6, { message: '密码至少 6 位' })
  password!: string;

  @ApiProperty({ example: '123456', description: '邮箱验证码' })
  @IsString({ message: '验证码不能为空' })
  @Matches(/^[0-9]{4,6}$/u, { message: '验证码格式不正确' })
  code!: string;

  @ApiPropertyOptional({ example: 'LinkNest 用户', description: '用户昵称' })
  @IsOptional()
  @IsString({ message: '昵称格式不正确' })
  nickname?: string;
}
