import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { SurveyService } from './survey.service';
@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get()
  @HttpCode(200)
  async surveyGet(): Promise<any> {
    return await this.surveyService.surveyGet();
  }

  @Post('calculate')
  @HttpCode(200)
  async calculate(@Body() input: any): Promise<any> {
    return await this.surveyService.calculate(input.user_id, input.choices);
  }

  @Get('share-type')
  @HttpCode(200)
  async getShare(@Query() input: any): Promise<any> {
    return await this.surveyService.getResult(input);
  }
}
