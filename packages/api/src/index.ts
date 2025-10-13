import { Link } from './entities/link.entity';

import { CreateLinkDto } from './dtos/create-link.dto';
import { UpdateLinkDto } from './dtos/update-link.dto';

import { ConfigRepository } from './repositories/config.repository';
import { LoggingRepository } from './repositories/logging.repository';

import { GlobalExceptionFilter } from './middlewares/global-exception.filter';

export {
  LinknestEnvironment,
  MetadataKey,
  LogLevel,
  LinknestHeader,
} from './common/enum';

export {
  Link,
  CreateLinkDto,
  UpdateLinkDto,
  ConfigRepository,
  LoggingRepository,
  GlobalExceptionFilter,
};

export const dto = {
  CreateLinkDto,
  UpdateLinkDto,
}

export const entities = {
  Link,
}

export const repositories = [
  ConfigRepository,
  LoggingRepository,
]

export const middlewares = [
  GlobalExceptionFilter,
]
