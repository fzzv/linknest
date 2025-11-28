import { Module } from '@nestjs/common';
import { controllers } from 'src/controllers';

@Module({
  imports: [],
  controllers: [
    ...controllers
  ],
})

export class ApiModule { }
