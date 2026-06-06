import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { OTPService } from './otp.service';
import { OTPInput } from './dto/otp.input';
import { OTPVerifyInput } from './dto/otp-verify.input';

@Controller('otp')
export class OTPController {
  constructor(private readonly oTPService: OTPService) {}

  @Post()
  @HttpCode(200)
  async getOTP(@Body() input: OTPInput): Promise<any> {
    const result = this.oTPService.getOTP(input);
    return result;
  }

  @Post('verify')
  @HttpCode(200)
  async verifyOTP(@Body() input: OTPVerifyInput): Promise<any> {
    const result = this.oTPService.verifyOTP(input);
    return result;
  }
}
