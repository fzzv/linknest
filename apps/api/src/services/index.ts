import { ConfigurationService } from 'src/services/configuration.service';
import { UserService } from 'src/services/user.service';
import { Provider } from '@nestjs/common';

export const services: Provider[] = [
  ConfigurationService,
  UserService
];
