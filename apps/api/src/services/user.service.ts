import { PrismaService } from "@linknest/db";
import type { User } from "@linknest/db";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto, RefreshTokenDto, RegisterUserDto, SendVerificationCodeDto } from "src/dtos";
import { ConfigurationService } from "src/services/configuration.service";
import { MailService } from "src/services/mail.service";
import { VerificationCodeService } from "src/services/verification-code.service";
import { hashPassword, verifyPassword } from "src/utils/password.util";
import { I18nService } from "nestjs-i18n";
import { AuthUser } from "src/types/auth";

@Injectable()
export class UserService {
  private readonly verificationCodeTtlMinutes = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly jwtService: JwtService,
    private readonly configurationService: ConfigurationService,
    private readonly i18n: I18nService
  ) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async sendVerificationCode({ email }: SendVerificationCodeDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException(this.i18n.t('error.emailAlreadyExists'));
    }

    const cooldown = await this.verificationCodeService.getCooldownInSeconds(email);
    if (cooldown > 0) {
      throw new BadRequestException(this.i18n.t('error.tryAgainLater', { args: { cooldown } }));
    }

    const code = this.generateVerificationCode();
    await this.mailService.sendVerificationCode(email, code, this.verificationCodeTtlMinutes);
    await this.verificationCodeService.setCode(email, code, this.verificationCodeTtlMinutes * 60 * 1000);

    return { message: this.i18n.t('messages.sendVerificationCode') };
  }

  async register({ email, password, code, nickname }: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException(this.i18n.t('error.emailAlreadyExists'));
    }

    const isValidCode = await this.verificationCodeService.verifyCode(email, code);
    if (!isValidCode) {
      throw new BadRequestException(this.i18n.t('error.invalidCode'));
    }

    const hashedPassword = await hashPassword(password);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, nickname },
    });

    return { user: this.toSafeUser(user) };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(this.i18n.t('error.invalidEmailOrPassword'));
    }

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException(this.i18n.t('error.invalidEmailOrPassword'));
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.toSafeUser(user),
    };
  }

  async refreshTokens({ refreshToken }: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(refreshToken, {
        secret: this.configurationService.jwtRefreshSecret,
      });
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException(this.i18n.t('error.invalidRefreshToken'));
      }

      const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) {
        throw new UnauthorizedException(this.i18n.t('error.userNotFound'));
      }

      const tokens = await this.generateTokens(user);
      return {
        ...tokens,
        user: this.toSafeUser(user),
      };
    } catch {
      throw new UnauthorizedException(this.i18n.t('error.invalidRefreshToken'));
    }
  }

  private generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateTokens(user: User) {
    const payload: AuthUser = { userId: user.id, email: user.email, tokenType: 'access' };
    const refreshPayload: AuthUser = { ...payload, tokenType: 'refresh' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configurationService.jwtSecret,
        expiresIn: this.configurationService.expiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configurationService.jwtRefreshSecret,
        expiresIn: this.configurationService.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private toSafeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}
