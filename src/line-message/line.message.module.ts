import { Module } from '@nestjs/common';
import { LineMessageService } from './line-message.service';
import { LineMessageConfigModule } from 'src/config/line-message';
import { LineMessageController } from './line-message.controller';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [LineMessageConfigModule, HttpModule],
  controllers: [LineMessageController],
  providers: [LineMessageService],
  exports: [LineMessageService],
})
export class LineMessageModule {}
