import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SmsSenderController } from './sms-sender.controller';
import { SmsSenderService } from './sms-sender.service';
import { SMS8x8ConfigModule } from 'src/config/sms8x8';
import { MomentService } from 'src/utils/MomentService';

@Module({
  imports: [HttpModule, SMS8x8ConfigModule],
  providers: [SmsSenderService, MomentService],
  exports: [SmsSenderService],
  controllers: [SmsSenderController],
})
export class SmsSenderModule {}
