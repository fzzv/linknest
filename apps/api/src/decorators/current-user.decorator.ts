import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from 'src/types/auth';

// 从请求头中获取当前用户信息
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | AuthUser[keyof AuthUser] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!data) {
      return user;
    }
    return user?.[data];
  },
);
