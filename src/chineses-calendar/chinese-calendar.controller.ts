import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { ChineseCalendarService } from './chinese-calendar.service';
import { ChineseCalendarGetDairyInput } from './dto/chinese-calendar-get-diary.input';
import { ChineseCalendarGetMonthInput } from './dto/chinese-calendar-get-month.input';
@Controller('chinese-calendar')
export class ChineseCalendarController {
  constructor(
    private readonly chineseCalendarService: ChineseCalendarService,
  ) {}

  @Get('diary')
  @HttpCode(200)
  async getCalendarDairy(
    @Query() input: ChineseCalendarGetDairyInput,
  ): Promise<any> {
    return await this.chineseCalendarService.getCalendarDairy(input);
  }

  @Get('month')
  @HttpCode(200)
  async getCalendarMonth(
    @Query() input: ChineseCalendarGetMonthInput,
  ): Promise<any> {
    return await this.chineseCalendarService.getCalendarMonth(input);
  }
}
