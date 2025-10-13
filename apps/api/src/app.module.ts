import { Module } from '@nestjs/common';
import { KyselyModule } from 'nestjs-kysely';
import { PostgresJSDialect } from 'kysely-postgres-js'
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import postgres from 'postgres';

import { repositories, ConfigRepository, GlobalExceptionFilter } from '@linknest/api';
import { controllers } from 'src/controllers/index';
import { services } from 'src/services/index';

// all common services and repositories and global exception filter
const common = [...repositories, ...services, GlobalExceptionFilter];

const middleware = [
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },
]

const configRepository = new ConfigRepository();
const { cls, database } = configRepository.getEnv();

const imports = [
  // 配置CLS（Continuation Local Storage）用于请求上下文管理
  ClsModule.forRoot(cls.config),
  // Kysely 配置数据库
  KyselyModule.forRoot({
    dialect: new PostgresJSDialect({ postgres: postgres(database.config.kysely) }),
    log(event) {
      if (event.level === 'error') {
        console.error('查询失败(Query failed):', {
          durationMs: event.queryDurationMillis,
          error: event.error,
          sql: event.query.sql,
          params: event.query.parameters,
        });
      }
    },
  })
]

@Module({
  imports: [...imports, ScheduleModule.forRoot()],
  controllers: [...controllers],
  providers: [...common, ...middleware],
})
export class AppModule {}
