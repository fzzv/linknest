import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  email!: string;

  @IsString({ message: '密码格式不正确' })
  @MinLength(6, { message: '密码至少 6 位' })
  password!: string;
}
