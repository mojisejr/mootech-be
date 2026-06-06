import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ChineseHoroscopeAnalyticInput } from './dto/chinese-horoscope-analytic.input';
import { ChineseHoroscopeResponse } from './model/chinese-horoscope-response.model';
import { ChineseHoroscopeService } from './chinese-horoscope.service';
import { CompatibilityLoveAnalyticInput } from './dto/compatibility-love-analytic.input';
import { ChineseHoroscopeAnalyticGetInput } from './dto/chinese-horoscope-analytic-get.input';
@Controller('chinese-horoscope')
export class ChineseHoroscopeController {
  constructor(
    private readonly chineseHoroscopeService: ChineseHoroscopeService,
  ) {}

  @Post()
  @HttpCode(200)
  async chineseHoroscope4Rows(
    @Body() input: ChineseHoroscopeAnalyticInput,
  ): Promise<ChineseHoroscopeResponse> {
    return await this.chineseHoroscopeService.chineseHoroscope4Rows(input);
  }

  @Post('compatibility-love')
  @HttpCode(200)
  async compatibilityLove(
    @Body() input: CompatibilityLoveAnalyticInput,
  ): Promise<ChineseHoroscopeResponse> {
    return await this.chineseHoroscopeService.compatibilityLove(input);
  }

  @Get('compatibility-love')
  @HttpCode(200)
  async isCheckCompatibilityLove(
    @Query() input: CompatibilityLoveAnalyticInput,
  ): Promise<ChineseHoroscopeResponse> {
    return await this.chineseHoroscopeService.isCheckCompatibilityLove(input);
  }

  @Post('compatibility-work')
  @HttpCode(200)
  async compatibilityWork(
    @Body() input: CompatibilityLoveAnalyticInput,
  ): Promise<ChineseHoroscopeResponse> {
    return await this.chineseHoroscopeService.compatibilityWork(input);
  }

  @Get('compatibility-work')
  @HttpCode(200)
  async isCheckCompatibilityWork(
    @Query() input: any,
  ): Promise<ChineseHoroscopeResponse> {
    return await this.chineseHoroscopeService.isCheckCompatibilityWork(input);
  }

  @Get()
  @HttpCode(200)
  async getResult(
    @Query() input: ChineseHoroscopeAnalyticGetInput,
  ): Promise<ChineseHoroscopeResponse> {
    return await this.chineseHoroscopeService.getResult(input);
  }

  @Get('share-profile')
  @HttpCode(200)
  async getShare(
    @Query() input: ChineseHoroscopeAnalyticGetInput,
  ): Promise<ChineseHoroscopeResponse> {
    return await this.chineseHoroscopeService.getShare(input);
  }
}
