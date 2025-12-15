import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { LoggingInterceptor } from 'src/interceptors/logging.interceptor';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 启用 CORS
  app.enableCors();
  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 移除未定义的属性
    forbidNonWhitelisted: true, // 移除未定义的属性时，抛出异常
    transform: true, // 自动转换请求体为 DTO 类型
  }));
  // 全局拦截器：日志与统一响应结构
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());
  // 配置静态资源目录
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  // Swagger 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('LinkNest API')
    .setDescription('LinkNest 接口文档')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}

void bootstrap();
