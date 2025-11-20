import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@linknest/db';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
