import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { ConfigRepository, LoggingRepository, LinknestEnvironment } from '@linknest/api';
import { serverVersion } from 'src/constants';

async function bootstrap() {
  process.title = 'linknest-api';

  const app = await NestFactory.create(AppModule);

  // 设置日志上下文
  const logger = await app.resolve(LoggingRepository);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  const configRepository = app.get(ConfigRepository);
  const { environment, host, port } = configRepository.getEnv();
  const isDev = environment === LinknestEnvironment.DEVELOPMENT;
  if (isDev) {
    // 开发环境允许跨域
    app.enableCors();
  }
  const server = await (host ? app.listen(port, host) : app.listen(port));
  server.requestTimeout = 24 * 60 * 60 * 1000;
  logger.log(`Server is running on ${await app.getUrl()} [v${serverVersion}] [${environment}]`);
}

void bootstrap();
