import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { services } from 'src/services';
import { AuthGuard } from 'src/guards/auth.guard';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<JwtSignOptions['expiresIn']>('JWT_EXPIRES_IN') },
      }),
      global: true,
    }),
  ],
  providers: [
    ...services,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
  exports: [
    ...services,
  ],
})
export class SharedModule { }
