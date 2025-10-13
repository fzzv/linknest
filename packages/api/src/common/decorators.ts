import { SetMetadata } from "@nestjs/common";
import { MetadataKey } from "./enum";

/**
 * 遥测装饰器 声明式地标记哪些路由要采集遥测数据
 * @param options 
 * @returns 
 */
export const Telemetry = (options: { enabled?: boolean }) =>
  SetMetadata(MetadataKey.TELEMETRY_ENABLED, options?.enabled ?? true);
