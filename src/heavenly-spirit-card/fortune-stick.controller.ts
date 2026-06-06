import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { HeavenlySpiritCardService } from './heavenly-spirit-card.service';
import { HeavenlySpiritCardGetInput } from './dto/heavenly-spirit-card-get.input';

@Controller('heaven-spirit-card')
export class HeavenlySpiritCardController {
  constructor(
    private readonly heavenlySpiritCardService: HeavenlySpiritCardService,
  ) {}

  @Get()
  @HttpCode(200)
  async getFortuneStick(
    @Query() input: HeavenlySpiritCardGetInput,
  ): Promise<any> {
    return await this.heavenlySpiritCardService.getFortuneStick(input);
  }
}
