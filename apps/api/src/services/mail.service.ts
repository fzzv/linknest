import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigurationService } from 'src/services/configuration.service';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configurationService: ConfigurationService) {
    this.transporter = nodemailer.createTransport({
      host: this.configurationService.smtpHost,
      port: this.configurationService.smtpPort,
      secure: +this.configurationService.smtpPort === 465,
      auth: {
        user: this.configurationService.smtpUser,
        pass: this.configurationService.smtpPass,
      },
    });
  }

  /**
   * 发送验证码
   * @param email - 邮箱
   * @param code - 验证码
   * @param expiresInMinutes - 过期时间（分钟）
   */
  async sendVerificationCode(email: string, code: string, expiresInMinutes: number) {
    try {
      await this.transporter.sendMail({
        from: {
          name: 'LinkNest',
          address: this.configurationService.smtpUser,
        },
        to: email,
        subject: 'LinkNest 注册验证码',
        html: `您的验证码为 <b>${code}</b>，${expiresInMinutes} 分钟内有效。如非本人操作请忽略。`,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message, error.stack);
      } else {
        this.logger.error('Failed to send verification email');
      }
      throw new InternalServerErrorException('验证码发送失败，请稍后重试');
    }
  }
}
