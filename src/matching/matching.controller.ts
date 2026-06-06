import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingCreateInput } from './dto/matching-create.input';
import { MatchingGetInput } from './dto/matching-get.input';
import { MatchingGetDetailInput } from './dto/matching-get-detail.input';

@Controller('user-matching')
export class UserMatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post()
  @HttpCode(200)
  async calculateMatching(@Body() input: MatchingCreateInput): Promise<any> {
    const result = this.matchingService.calculateMatching(input);
    return result;
  }

  @Post('recalculate')
  @HttpCode(200)
  async reCalculateMatching(
    @Body() input: MatchingGetDetailInput,
  ): Promise<any> {
    const result = this.matchingService.reCalculateMatching(input);
    return result;
  }

  @Get()
  @HttpCode(200)
  async getLogMatching(@Query() input: MatchingGetInput): Promise<any> {
    const result = this.matchingService.getLogMatching(input);
    return result;
  }

  @Get('detail')
  @HttpCode(200)
  async getLogMatchingDetail(
    @Query() input: MatchingGetDetailInput,
  ): Promise<any> {
    const result = this.matchingService.getLogMatchingDetail(input);
    return result;
  }
}
