import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { services } from 'src/services';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] })],
  providers: [
    ...services
  ],
  exports: [
    ...services
  ],
})
export class SharedModule { }
