import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { MemberPaymentCodeAppendInput } from 'src/member-payment-code/dto/member-payment-code-append.input';
import { MemberPaymentCodeService } from 'src/member-payment-code/member-payment-code.service';

@Controller('member-payment-code')
export class MemberPaymentCodeController {
  constructor(
    private readonly memberPaymentCodeService: MemberPaymentCodeService,
  ) {}

  @Post('check')
  @HttpCode(200)
  async appendMemberPaymentCode(
    @Body() input: MemberPaymentCodeAppendInput,
  ): Promise<any> {
    const result = this.memberPaymentCodeService.checkMemberPaymentCode(input);
    return result;
  }
}
