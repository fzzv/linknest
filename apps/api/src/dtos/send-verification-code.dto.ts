import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendVerificationCodeDto {
  @ApiProperty({ example: 'user@example.com', description: '接收验证码的邮箱' })
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  email!: string;
}
