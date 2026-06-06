import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SendGridService } from './send-grid.service';
import { SendGridSendEmailInput } from './dto/send-grid-email-input';

@Controller('email')
export class SendGridController {
  constructor(private readonly sendGridService: SendGridService) {}

  @Post()
  @HttpCode(200)
  async sendEmail(@Body() input: SendGridSendEmailInput): Promise<any> {
    const result = this.sendGridService.sendEmail(input);
    return result;
  }
}
