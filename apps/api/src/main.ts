import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 启用 CORS
  app.enableCors();
  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 移除未定义的属性
    forbidNonWhitelisted: true, // 移除未定义的属性时，抛出异常
    transform: true, // 自动转换请求体为 DTO 类型
  }));
  await app.listen(3000);
}

void bootstrap();
