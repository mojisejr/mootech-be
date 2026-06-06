import { Body, Controller, Post } from '@nestjs/common';
import { LineMessageService } from './line-message.service';

@Controller('line')
export class LineMessageController {
  constructor(private readonly lineMessageService: LineMessageService) {}

  @Post('multicast')
  multicast(@Body() dto: any) {
    return this.lineMessageService.multicastText(dto.userIds, dto.message);
  }
}
