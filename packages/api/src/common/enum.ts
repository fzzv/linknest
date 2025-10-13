// 环境
export enum LinknestEnvironment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

// 元数据键
export enum MetadataKey {
  TELEMETRY_ENABLED = 'telemetry-enabled', // 是否启用遥测
}

// 日志级别
export enum LogLevel {
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// 请求头
export enum LinknestHeader {
  CID = 'X-Linknest-CID',
}
