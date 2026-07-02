import { Module } from '@nestjs/common';
import { LineMessageService } from './line-message.service';
import { LineMessageConfigModule } from 'src/config/line-message';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [LineMessageConfigModule, HttpModule],
  providers: [LineMessageService],
  exports: [LineMessageService],
})
export class LineMessageModule {}
