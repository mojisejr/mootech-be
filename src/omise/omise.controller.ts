import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { OmiseService } from './omise.service';
import {
  OmiseChargeInput,
  OmisePromptPayInput,
} from './dto/omise-charge.input';

@Controller('omise')
export class OmiseController {
  constructor(private readonly omiseService: OmiseService) {}

  @Post('retrieve')
  async retrieveCharge(@Body() body: any) {
    const { chargeId } = body;
    return this.omiseService.retrieveCharge(chargeId);
  }

  @Post('promptpay')
  async payWithPromptPay(@Body() body: OmisePromptPayInput) {
    const { email, user_id, payment_by, package_code } = body;
    return this.omiseService.createPromptPay(
      email,
      user_id,
      payment_by,
      package_code,
    );
  }

  @Post('charge')
  async charge(@Body() body: OmiseChargeInput) {
    const { token, email, user_id, payment_by, package_code } = body;

    const result = await this.omiseService.chargeCard(
      token,
      email,
      user_id,
      payment_by,
      package_code,
    );

    return {
      status: 'ok',
      charge: result,
    };
  }

  // Omise posts here. express.raw (see main.ts) makes req.body the raw Buffer so
  // the HMAC signature can be verified over the exact bytes Omise signed.
  @Post('/webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: any,
    @Headers('omise-signature') signature: string,
    @Headers('omise-signature-timestamp') timestamp: string,
  ) {
    return this.omiseService.handleWebhook(req.body, signature, timestamp);
  }
}
