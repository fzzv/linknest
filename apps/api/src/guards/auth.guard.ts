import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PUBLIC_API_KEY } from 'src/decorators/public-api.decorator';
import { ConfigurationService } from 'src/services/configuration.service';

interface JwtPayload {
  sub: number;
  email: string;
  tokenType?: 'access' | 'refresh';
  [key: string]: unknown;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configurationService: ConfigurationService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // 检查是否为公共 API
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 提取请求头中的 token
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // 验证 token
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configurationService.jwtSecret,
      });
      // 检查 token 类型
      if (payload.tokenType && payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token');
      }
      // 设置用户信息
      (request as Request & { user?: JwtPayload }).user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  /**
   * 提取请求头中的 token
   * @param request - 请求
   * @returns - token
   */
  private extractTokenFromHeader(request: Request) {
    const header = request.headers['authorization'];
    if (!header) {
      return null;
    }
    const [type, token] = header.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
