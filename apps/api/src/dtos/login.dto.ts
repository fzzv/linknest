import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: '登录邮箱' })
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  email!: string;

  @ApiProperty({ example: 'Passw0rd', description: '登录密码' })
  @IsString({ message: '密码格式不正确' })
  @MinLength(8, { message: '密码至少 8 位' })
  password!: string;
}
