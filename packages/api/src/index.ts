import { Link } from './entities/link.entity';

import { CreateLinkDto } from './dtos/create-link.dto';
import { UpdateLinkDto } from './dtos/update-link.dto';
import { CreateUserDto } from './dtos/user.dto';

import { ConfigRepository } from './repositories/config.repository';
import { LoggingRepository } from './repositories/logging.repository';
import { UserRepository } from './repositories/user.repository';

import { GlobalExceptionFilter } from './middlewares/global-exception.filter';

export * from './common/enum';

export * from './schema';

export {
  Link,
  CreateLinkDto,
  UpdateLinkDto,
  CreateUserDto,
  ConfigRepository,
  LoggingRepository,
  GlobalExceptionFilter,
  UserRepository,
};

export const dto = {
  CreateLinkDto,
  UpdateLinkDto,
  CreateUserDto,
}

export const entities = {
  Link,
}

export const repositories = [
  ConfigRepository,
  LoggingRepository,
  UserRepository,
]

export const middlewares = [
  GlobalExceptionFilter,
]
