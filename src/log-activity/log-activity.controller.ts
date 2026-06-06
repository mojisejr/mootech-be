import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { LogActivityService } from './log-activity.service';
import { LogActivityGetInput } from './dto/log-activity-get.input';
@Controller('log-activity')
export class LogActivityController {
  constructor(private readonly logActivityService: LogActivityService) {}

  @Get()
  @HttpCode(200)
  async getLogsByUserId(@Query() input: LogActivityGetInput): Promise<any> {
    return await this.logActivityService.getLogsByUserId(input.user_id);
  }
}
