import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { LogWorkVibeService } from './log-work-vibe.service';
import { LogWorkVibeCheckInput } from './dto/log-work-vibe-check.input';
import { LogWorkVibeInsertInput } from './dto/log-work-vibe-insert.input';
@Controller('log-work-vibe')
export class LogWorkVibeController {
  constructor(private readonly logWorkVibeService: LogWorkVibeService) {}

  @Get()
  @HttpCode(200)
  async getLogWorkVibes(@Query() input: LogWorkVibeCheckInput): Promise<any> {
    return await this.logWorkVibeService.getLogWorkVibes(input);
  }

  @Post()
  @HttpCode(200)
  async insertLogWorkVibe(@Body() input: LogWorkVibeInsertInput): Promise<any> {
    return await this.logWorkVibeService.insertLogWorkVibe(input);
  }
}
