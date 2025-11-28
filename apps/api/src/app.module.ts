import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ApiModule } from 'src/api.module';
import { SharedModule } from 'src/share.module';
import { I18nModule, QueryResolver, HeaderResolver, AcceptLanguageResolver, CookieResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver, // Accept-Language=en
        { use: HeaderResolver, options: ['x-lang'] },
        { use: CookieResolver, options: ['lang'] },
      ],
    }),
    PrismaModule,
    ApiModule,
    SharedModule,
  ],
})
export class AppModule { }
