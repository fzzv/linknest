import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/services/redis.service';

interface VerificationCodePayload {
  code: string;
}

@Injectable()
export class VerificationCodeService {
  private readonly ttlSeconds = 10 * 60; // 10 分钟
  private readonly resendCooldownSeconds = 60; // 1 分钟

  constructor(private readonly redisService: RedisService) {}

  /**
   * 设置验证码
   * @param email - 邮箱
   * @param code - 验证码
   * @param ttlMs - 过期时间（毫秒）
   */
  async setCode(email: string, code: string, ttlMs = this.ttlSeconds * 1000) {
    // 计算过期时间（秒）
    const ttlSeconds = Math.floor(ttlMs / 1000);
    // 设置验证码
    await this.redisService.set(this.getCodeKey(email), JSON.stringify({ code }), ttlSeconds);
    // 设置冷却时间
    await this.redisService.set(this.getCooldownKey(email), '1', this.resendCooldownSeconds);
  }

  /**
   * 验证验证码
   * @param email - 邮箱
   * @param code - 验证码
   * @returns - 是否验证成功
   */
  async verifyCode(email: string, code: string) {
    // 获取验证码
    const payload = await this.redisService.get<VerificationCodePayload>(this.getCodeKey(email));
    // 验证验证码
    if (!payload || payload.code !== code) {
      return false;
    }
    // 删除验证码
    await this.redisService.del(this.getCodeKey(email));
    // 删除冷却时间
    await this.redisService.del(this.getCooldownKey(email));
    return true;
  }

  /**
   * 获取冷却时间
   * @param email - 邮箱
   * @returns - 冷却时间（秒）
   */
  async getCooldownInSeconds(email: string) {
    return this.redisService.ttl(this.getCooldownKey(email));
  }

  /**
   * 获取验证码键
   * @param email - 邮箱
   * @returns - 验证码键
   */
  private getCodeKey(email: string) {
    return `verification:code:${email}`;
  }

  /**
   * 获取冷却时间键
   * @param email - 邮箱
   * @returns - 冷却时间键
   */
  private getCooldownKey(email: string) {
    return `verification:cooldown:${email}`;
  }
}
