import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { FortuneTellingService } from './fortune-telling.service';
import { FortuneTellingGetInput } from './dto/fortune-telling-get.input';

@Controller('fortune-telling')
export class FortuneTellingController {
  constructor(private readonly fortuneTellingService: FortuneTellingService) {}

  @Get()
  @HttpCode(200)
  async getFortuneStick(@Query() input: FortuneTellingGetInput): Promise<any> {
    return await this.fortuneTellingService.getFortuneStick(input);
  }
}
