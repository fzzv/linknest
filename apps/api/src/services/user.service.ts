import { PrismaService } from "@linknest/db";
import type { User } from "@linknest/db";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto, RefreshTokenDto, RegisterUserDto, SendVerificationCodeDto } from "src/dtos";
import { ConfigurationService } from "src/services/configuration.service";
import { MailService } from "src/services/mail.service";
import { VerificationCodeService } from "src/services/verification-code.service";
import { hashPassword, verifyPassword } from "src/utils/password.util";

export type JwtPayload = {
  sub: number;
  email: string;
  tokenType?: 'access' | 'refresh';
};

@Injectable()
export class UserService {
  private readonly verificationCodeTtlMinutes = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly jwtService: JwtService,
    private readonly configurationService: ConfigurationService,
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
      throw new BadRequestException('该邮箱已注册');
    }

    const cooldown = await this.verificationCodeService.getCooldownInSeconds(email);
    if (cooldown > 0) {
      throw new BadRequestException(`请 ${cooldown} 秒后再试`);
    }

    const code = this.generateVerificationCode();
    await this.mailService.sendVerificationCode(email, code, this.verificationCodeTtlMinutes);
    await this.verificationCodeService.setCode(email, code, this.verificationCodeTtlMinutes * 60 * 1000);

    return { message: '验证码已发送' };
  }

  async register({ email, password, code, nickname }: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('该邮箱已注册');
    }

    const isValidCode = await this.verificationCodeService.verifyCode(email, code);
    if (!isValidCode) {
      throw new BadRequestException('验证码无效或已过期');
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
      throw new UnauthorizedException('邮箱或密码不正确');
    }

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('邮箱或密码不正确');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.toSafeUser(user),
    };
  }

  async refreshTokens({ refreshToken }: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configurationService.jwtRefreshSecret,
      });
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Refresh Token 无效');
      }

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const tokens = await this.generateTokens(user);
      return {
        ...tokens,
        user: this.toSafeUser(user),
      };
    } catch {
      throw new UnauthorizedException('Refresh Token 无效或已过期');
    }
  }

  private generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, tokenType: 'access' };
    const refreshPayload: JwtPayload = { ...payload, tokenType: 'refresh' };

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
