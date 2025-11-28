import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';
import { ConfigurationService } from 'src/services/configuration.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClientType;

  constructor(private readonly configurationService: ConfigurationService) {
    this.client = createClient({
      socket: {
        host: this.configurationService.redisHost,
        port: this.configurationService.redisPort,
      },
      password: this.configurationService.redisPassword || undefined,
    });
  }

  /**
   * 初始化 Redis 连接
   */
  async onModuleInit() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  /**
   * 关闭 Redis 连接
   */
  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  /**
   * 设置缓存
   * @param key - 键
   * @param value - 值
   * @param ttlSeconds - 过期时间（秒）
   */
  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.client.set(key, value, { EX: ttlSeconds });
      return;
    }
    await this.client.set(key, value);
  }

  /**
   * 获取缓存
   * @param key - 键
   * @returns - 值
   */
  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (value === null || typeof value !== 'string') {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * 删除缓存
   * @param key - 键
   */
  async del(key: string) {
    await this.client.del(key);
  }

  /**
   * 获取缓存过期时间
   * @param key - 键
   * @returns - 过期时间（秒）
   */
  async ttl(key: string) {
    const ttl = await this.client.ttl(key);
    return ttl > 0 ? ttl : 0;
  }
}
