import { Module } from '@nestjs/common';
import { LineMessageModule } from 'src/line-message/line.message.module';
import { CronjobService } from './cronjob.service';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
import { ChineseCalendarModule } from 'src/chineses-calendar/entity/chinese-calendar.module';
import { MomentService } from 'src/utils/MomentService';

@Module({
  imports: [LineMessageModule, MemberPaymentModule, ChineseCalendarModule],
  providers: [CronjobService, MomentService],
})
export class CronjobModule {}
