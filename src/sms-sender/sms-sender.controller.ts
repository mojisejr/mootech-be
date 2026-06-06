import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SMSSendSMSInput } from './dto/sms-send-sms-input';
import { SmsSenderService } from './sms-sender.service';

@Controller('sms')
export class SmsSenderController {
  constructor(private readonly sMSService: SmsSenderService) {}

  @Post()
  @HttpCode(200)
  async sendSMS(@Body() input: SMSSendSMSInput): Promise<any> {
    const result = this.sMSService.sendSMS(input);
    return result;
  }
}
