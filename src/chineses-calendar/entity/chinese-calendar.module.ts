import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { ChineseCalendar } from './chinese-calendar-entity.model';
import { ChineseCalendarDescAbove } from './chinese-calendar-desc-above-entity.model';
import { ChineseCalendarDescBelow } from './chinese-calendar-desc-below-entity.model';
import { ChineseCalendarController } from '../chinese-calendar.controller';
import { ChineseCalendarService } from '../chinese-calendar.service';
import { ScaredThingModule } from 'src/scared-thing/scared-thing.module';
import { AnalyticColorModule } from 'src/analytic-color/analytic-color.module';
import { ColorModule } from 'src/color/color.module';
import { DirectionModule } from 'src/direction/direction.module';
import { HolidayModule } from 'src/holiday/holiday.module';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChineseCalendar,
      ChineseCalendarDescAbove,
      ChineseCalendarDescBelow,
    ]),
    ScaredThingModule,
    AnalyticColorModule,
    ColorModule,
    DirectionModule,
    HolidayModule,
    MemberPaymentModule,
  ],
  controllers: [ChineseCalendarController],
  providers: [ChineseCalendarService, MomentService],
  exports: [ChineseCalendarService],
})
export class ChineseCalendarModule {}
