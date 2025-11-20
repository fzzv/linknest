import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ApiModule } from 'src/api.module';
import { SharedModule } from 'src/share.module';

@Module({
  imports: [
    PrismaModule, 
    ApiModule, 
    SharedModule,
  ],
})
export class AppModule {}
