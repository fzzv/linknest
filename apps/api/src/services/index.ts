import { Provider } from '@nestjs/common';
import { ConfigurationService } from 'src/services/configuration.service';
import { MailService } from 'src/services/mail.service';
import { RedisService } from 'src/services/redis.service';
import { UserService } from 'src/services/user.service';
import { VerificationCodeService } from 'src/services/verification-code.service';
import { CategoryService } from 'src/services/category.service';
import { LinkService } from 'src/services/link.service';
import { BookmarkImportService } from 'src/services/bookmark-import.service';
import { LinkIconService } from 'src/services/link-icon.service';
import { UploadService } from 'src/services/upload.service';
import { BookmarkExportService } from 'src/services/bookmark-export.service';

export const services: Provider[] = [
  ConfigurationService,
  MailService,
  RedisService,
  VerificationCodeService,
  UserService,
  CategoryService,
  LinkService,
  BookmarkImportService,
  LinkIconService,
  UploadService,
  BookmarkExportService,
];
