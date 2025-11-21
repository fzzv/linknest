import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  email!: string;

  @IsString({ message: '密码格式不正确' })
  @MinLength(6, { message: '密码至少 6 位' })
  password!: string;

  @IsString({ message: '验证码不能为空' })
  @Matches(/^[0-9]{4,6}$/u, { message: '验证码格式不正确' })
  code!: string;

  @IsOptional()
  @IsString({ message: '昵称格式不正确' })
  nickname?: string;
}
