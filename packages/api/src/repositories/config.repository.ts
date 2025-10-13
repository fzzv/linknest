import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { Injectable } from "@nestjs/common";
import { ClsModuleOptions, CLS_ID } from "nestjs-cls";
import { parse } from 'pg-connection-string';
import { Notice } from 'postgres';
import { Request, Response } from 'express';
import { EnvDto } from "../dtos/env.dto";
import { LinknestEnvironment, LinknestHeader } from "../common/enum";
import { Telemetry } from "../common/decorators";

// SSL 连接类型定义
type Ssl = 'require' | 'allow' | 'prefer' | 'verify-full' | boolean | object;
// PostgreSQL 连接配置类型定义
type PostgresConnectionConfig = {
  host?: string;
  password?: string;
  user?: string;
  port?: number;
  database?: string;
  client_encoding?: string;
  ssl?: Ssl;
  application_name?: string;
  fallback_application_name?: string;
  options?: string;
};

export interface EnvData {
  host?: string;
  port: number;
  environment: LinknestEnvironment;
  database: {
    config: { kysely: PostgresConnectionConfig };
    skipMigrations: boolean;
  },
  // 控制台输出是否使用颜色
  noColor: boolean;
  // CLS (Continuation Local Storage) 配置，用于请求上下文管理
  cls: {
    config: ClsModuleOptions;
  };
}

// 获取环境配置的主函数
const getEnv = (): EnvData => {
  // 将环境变量转换为强类型的 DTO 对象
  const dto = plainToInstance(EnvDto, process.env);
  // 验证环境变量是否符合要求
  const errors = validateSync(dto);
  if (errors.length > 0) {
    throw new Error(
      `无效的环境变量(Invalid environment variables): ${errors.map((error) => `${error.property}=${error.value}`).join(', ')}`,
    );
  }

  const environment = dto.LINKNEST_ENV || LinknestEnvironment.PRODUCTION;

  // 配置数据库连接参数
  const parts = {
    connectionType: 'parts',
    host: dto.DB_HOSTNAME || 'database',
    port: dto.DB_PORT || 5432,
    username: dto.DB_USERNAME || 'postgres',
    password: dto.DB_PASSWORD || 'postgres',
    database: dto.DB_DATABASE_NAME || 'linknest',
  } as const;

  // 验证 SSL 配置是否有效
  const isValidSsl = (ssl?: string | boolean | object): ssl is Ssl =>
    typeof ssl !== 'string' || ssl === 'require' || ssl === 'allow' || ssl === 'prefer' || ssl === 'verify-full';

  // 处理数据库 URL 配置
  let parsedOptions: PostgresConnectionConfig = parts;
  if (dto.DB_URL) {
    const parsed = parse(dto.DB_URL);
    if (!isValidSsl(parsed.ssl)) {
      throw new Error(`无效的 SSL 配置(Invalid SSL configuration): ${parsed.ssl}`);
    }

    parsedOptions = {
      ...parsed,
      ssl: parsed.ssl,
      host: parsed.host ?? undefined,
      port: parsed.port ? Number(parsed.port) : undefined,
      database: parsed.database ?? undefined,
    };
  }

  // 配置 Kysely 数据库驱动
  const driverOptions = {
    ...parsedOptions,
    // 捕获 PostgreSQL 发出的 notice 消息
    onnotice: (notice: Notice) => {
      if (notice['severity'] !== 'NOTICE') {
        console.warn('Postgres notice:', notice);
      }
    },
    max: 10, // 设置最大连接数
    types: { // 设置类型转换
      date: { // 设置日期类型转换
        to: 1184,
        from: [1082, 1114, 1184],
        serialize: (x: Date | string) => (x instanceof Date ? x.toISOString() : x),
        parse: (x: string) => new Date(x),
      },
      bigint: { // 设置 bigint 类型转换
        to: 20,
        from: [20],
        parse: (value: string) => Number.parseInt(value),
        serialize: (value: number) => value.toString(),
      },
    },
    connection: { // 设置时区
      TimeZone: 'UTC',
    },
  }

  return {
    host: dto.LINKNEST_HOST || '127.0.0.1',
    port: dto.LINKNEST_PORT || 3000,
    environment,

    database: {
      config: {
        kysely: driverOptions
      },
      skipMigrations: dto.DB_SKIP_MIGRATIONS || false,
    },
    noColor: dto.NO_COLOR || false,
    cls: {
      config: {
        // 为每个 HTTP 请求生成唯一的 Correlation ID (CID) 在整个请求处理链路中保持这个 ID，便于日志追踪和问题排查
        middleware: {
          mount: true,
          generateId: true,
          setup: (cls, req: Request, res: Response) => {
            const headerValues = req.headers[LinknestHeader.CID];
            const headerValue = Array.isArray(headerValues) ? headerValues[0] : headerValues;
            const cid = headerValue || cls.get(CLS_ID);
            cls.set(CLS_ID, cid);
            res.header(LinknestHeader.CID, cid);
          },
        },
      },
    },
  }
}

// 缓存环境配置，避免重复计算
let cached: EnvData | undefined;

@Injectable()
@Telemetry({ enabled: false })
export class ConfigRepository {
  
  constructor() {}

  getEnv(): EnvData {
    if (!cached) {
      cached = getEnv();
    }
    return cached;
  }
}

// 清除环境配置缓存的辅助函数
export const clearEnvCache = () => (cached = undefined);
