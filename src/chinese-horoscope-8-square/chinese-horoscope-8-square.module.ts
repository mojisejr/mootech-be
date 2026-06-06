import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChineseHoroscope8SquareAbove } from './entity/chinese-horoscope-8-square-above-entity.model';
import { ChineseHoroscope8SquareService } from './chinese-horoscope-8-square.service';
import { ChineseHoroscope8SquareBelow } from './entity/chinese-horoscope-8-square-below-entity.model';
import { ChineseHoroscope8SquareMonthChinese } from './entity/chinese-horoscope-8-square-month-chinese-entity.model';
import { ChineseHoroscope8SquareMonthHongHouTung } from './entity/chinese-horoscope-8-square-month-hong-hou-tung-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { ChineseHoroscope8SquareTimeHongHouTung } from './entity/chinese-horoscope-8-square-time-hong-hou-tung-entity.model';
import { ChineseHoroscope8SquareAscendant } from './entity/chinese-horoscope-8-square-ascendant-entity.model';
import { ChineseHoroscope8SquareCountingIm } from './entity/chinese-horoscope-8-square-counting-im-entity.model';
import { ChineseHoroscope8SquareHiddenZodiac } from './entity/chinese-horoscope-8-square-hidden-zodiac-entity.model';
import { Calendar100YearModule } from 'src/calendar-100-year/calendar-100-year.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChineseHoroscope8SquareAbove,
      ChineseHoroscope8SquareBelow,
      ChineseHoroscope8SquareMonthChinese,
      ChineseHoroscope8SquareMonthHongHouTung,
      ChineseHoroscope8SquareTimeHongHouTung,
      ChineseHoroscope8SquareAscendant,
      ChineseHoroscope8SquareCountingIm,
      ChineseHoroscope8SquareHiddenZodiac,
    ]),

    Calendar100YearModule,
  ],
  controllers: [],
  providers: [ChineseHoroscope8SquareService, MomentService],
  exports: [ChineseHoroscope8SquareService],
})
export class ChineseHoroscope8SquareModule {}
