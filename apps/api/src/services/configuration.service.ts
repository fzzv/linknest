import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService) { }
  get mysqlHost(): string {
    return this.configService.get<string>('MYSQL_HOST')!;
  }
  get mysqlPort(): number {
    return this.configService.get<number>('MYSQL_PORT')!;
  }
  get mysqlDb(): string {
    return this.configService.get<string>('MYSQL_DB')!;
  }
  get mysqlUser(): string {
    return this.configService.get<string>('MYSQL_USER')!;
  }
  get mysqlPass(): string {
    return this.configService.get<string>('MYSQL_PASSWORD')!;
  }
  get mysqlConfig() {
    return {
      host: this.mysqlHost,
      port: this.mysqlPort,
      database: this.mysqlDb,
      username: this.mysqlUser,
      password: this.mysqlPass,
    };
  }

  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST')!;
  }
  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT')!;
  }
  get redisPassword(): string {
    return this.configService.get<string>('REDIS_PASSWORD')!;
  }
  get redisConfig() {
    return {
      host: this.redisHost,
      port: this.redisPort,
      password: this.redisPassword
    }
  }

  get smtpHost(): string {
    return this.configService.get<string>('SMTP_HOST')!;
  }
  get smtpPort(): number {
    return this.configService.get<number>('SMTP_PORT')!;
  }
  get smtpUser(): string {
    return this.configService.get<string>('SMTP_USER')!;
  }
  get smtpPass(): string {
    return this.configService.get<string>('SMTP_PASS')!;
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET')!;
  }
  get expiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN')!;
  }
}
