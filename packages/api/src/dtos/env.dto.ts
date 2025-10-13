import { Type } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsInt, Max, Min, IsBoolean } from 'class-validator';
import { LinknestEnvironment } from '../common/enum';
import { ValidateBoolean } from '../common/validation';
import { Optional } from '../common/validation';

export class EnvDto {
  @IsString()
  @Optional()
  LINKNEST_HOST?: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @Optional()
  @Type(() => Number)
  LINKNEST_PORT?: number;

  @IsEnum(LinknestEnvironment)
  @Optional()
  LINKNEST_ENV?: LinknestEnvironment;

  /**
   * 数据库连接 URL
   * 格式：postgresql://username:password@host:port/database
   */
  @IsString()
  @Optional()
  DB_URL?: string;

  @IsString()
  @IsOptional()
  DB_DATABASE_NAME?: string;
  
  @IsString()
  @IsOptional()
  DB_HOSTNAME?: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  @Type(() => Number)
  DB_PORT?: number;

  @IsString()
  @IsOptional()
  DB_USERNAME?: string;
  
  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;
  
  @ValidateBoolean({ optional: true })
  DB_SKIP_MIGRATIONS?: boolean;

  /**
   * 控制台输出是否使用颜色
   */
  @IsBoolean()
  @Optional()
  NO_COLOR?: boolean;
}
