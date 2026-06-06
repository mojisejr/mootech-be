import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FortuneStickService } from './fortune-stick.service';
import { FortuneStickGetInput } from './dto/fortune-stick-get.input';
@Controller('fortune-stick')
export class FortuneStickController {
  constructor(private readonly fortuneStickService: FortuneStickService) {}

  @Get()
  @HttpCode(200)
  async getFortuneStick(@Query() input: FortuneStickGetInput): Promise<any> {
    return await this.fortuneStickService.getFortuneStick(input);
  }
}
