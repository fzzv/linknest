import { IsEmail } from 'class-validator';

export class SendVerificationCodeDto {
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  email!: string;
}
