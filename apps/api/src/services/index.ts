import { Provider } from '@nestjs/common';
import { ConfigurationService } from 'src/services/configuration.service';
import { MailService } from 'src/services/mail.service';
import { RedisService } from 'src/services/redis.service';
import { UserService } from 'src/services/user.service';
import { VerificationCodeService } from 'src/services/verification-code.service';

export const services: Provider[] = [
  ConfigurationService,
  MailService,
  RedisService,
  VerificationCodeService,
  UserService
];
