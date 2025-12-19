import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigurationService } from 'src/services/configuration.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly i18n: I18nService
  ) {
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
          name: this.i18n.t('email.name'),
          address: this.configurationService.smtpUser,
        },
        to: email,
        subject: this.i18n.t('email.subject'),
        html: this.i18n.t('email.content', { args: { code, expiresInMinutes } }),
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message, error.stack);
      } else {
        this.logger.error(this.i18n.t('error.failedToSendVerificationEmail'));
      }
      throw new InternalServerErrorException(this.i18n.t('error.failedToSendVerificationEmail'));
    }
  }

  /**
   * 发送重置密码验证码
   * @param email - 邮箱
   * @param code - 验证码
   * @param expiresInMinutes - 过期时间（分钟）
   */
  async sendPasswordResetCode(email: string, code: string, expiresInMinutes: number) {
    try {
      await this.transporter.sendMail({
        from: {
          name: this.i18n.t('email.name'),
          address: this.configurationService.smtpUser,
        },
        to: email,
        subject: this.i18n.t('email.resetSubject'),
        html: this.i18n.t('email.resetContent', { args: { code, expiresInMinutes } }),
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message, error.stack);
      } else {
        this.logger.error(this.i18n.t('error.failedToSendPasswordResetEmail'));
      }
      throw new InternalServerErrorException(this.i18n.t('error.failedToSendPasswordResetEmail'));
    }
  }
}
