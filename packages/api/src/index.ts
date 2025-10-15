import { CreateUserDto } from './dtos/user.dto';
import { CreateCategoryDto } from './dtos/category.dto';

import { ConfigRepository } from './repositories/config.repository';
import { LoggingRepository } from './repositories/logging.repository';
import { UserRepository } from './repositories/user.repository';
import { CategoryRepository } from './repositories/category.repository';

import { GlobalExceptionFilter } from './middlewares/global-exception.filter';

export * from './common/enum';

export * from './schema/tables';

export {
  CreateUserDto,
  CreateCategoryDto,
  ConfigRepository,
  LoggingRepository,
  GlobalExceptionFilter,
  UserRepository,
  CategoryRepository,
};

export const dto = {
  CreateUserDto,
  CreateCategoryDto,
}

export const repositories = [
  ConfigRepository,
  LoggingRepository,
  UserRepository,
  CategoryRepository,
]

export const middlewares = [
  GlobalExceptionFilter,
]
