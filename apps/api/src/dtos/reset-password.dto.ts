import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: '账号邮箱' })
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  email!: string;

  @ApiProperty({ example: '123456', description: '邮箱验证码' })
  @IsString({ message: '验证码不能为空' })
  @Matches(/^[0-9]{4,6}$/u, { message: '验证码格式不正确' })
  code!: string;

  @ApiProperty({ example: 'Passw0rd', description: '新密码' })
  @IsString({ message: '密码格式不正确' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/u, { message: '密码至少 8 位且包含大写字母和数字' })
  newPassword!: string;

  @ApiProperty({ example: 'Passw0rd', description: '确认密码' })
  @IsString({ message: '密码格式不正确' })
  confirmPassword!: string;
}
