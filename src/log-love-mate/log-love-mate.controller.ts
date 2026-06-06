import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { LogWoLoveMateService } from './log-love-mate.service';
import { LogLoveMateCheckInput } from './dto/log-love-mate-check.input';
import { LogLoveMateInsertInput } from './dto/log-love-mate-insert.input';
@Controller('log-love-mate')
export class LogLoveMateController {
  constructor(private readonly logLoveMateService: LogWoLoveMateService) {}

  @Get()
  @HttpCode(200)
  async getLogLoveMate(@Query() input: LogLoveMateCheckInput): Promise<any> {
    return await this.logLoveMateService.getLogLoveMate(input);
  }

  @Post()
  @HttpCode(200)
  async insertLogLoveMate(@Body() input: LogLoveMateInsertInput): Promise<any> {
    return await this.logLoveMateService.insertLogLoveMate(input);
  }
}
