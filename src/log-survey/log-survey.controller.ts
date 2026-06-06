import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { LogSurveyService } from './log-survey.service';
import { LogSurveyGetInput } from './dto/log-survey-get.input';
@Controller('log-survey')
export class LogSurveyController {
  constructor(private readonly logSurveyService: LogSurveyService) {}

  @Get()
  @HttpCode(200)
  async getLogSurveyByUser(@Query() input: LogSurveyGetInput): Promise<any> {
    return await this.logSurveyService.getLogSurveyByUser(input);
  }
}
