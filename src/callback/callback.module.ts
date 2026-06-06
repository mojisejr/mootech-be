import { Module } from '@nestjs/common';
import { CallBackController } from './callback.controller';
@Module({
  imports: [],
  controllers: [CallBackController],
  providers: [],
  exports: [],
})
export class CallBackModule {}
