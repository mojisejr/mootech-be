import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { OmiseService } from './omise.service';

@Controller('omise')
export class OmiseController {
  constructor(private readonly omiseService: OmiseService) {}

  @Post('card')
  async payWithCard(@Body() body: any) {
    const { amount, token } = body; // token ได้จาก frontend
    return this.omiseService.createCardCharge(amount, token);
  }

  @Post('retrieve')
  async retrieveCharge(@Body() body: any) {
    const { chargeId } = body;
    return this.omiseService.retrieveCharge(chargeId);
  }

  @Post('promptpay')
  async payWithPromptPay(@Body() body: any) {
    const { amount, email, user_id, payment_by, package_code } = body;
    return this.omiseService.createPromptPay(
      amount,
      email,
      user_id,
      payment_by,
      package_code,
    );
  }

  @Post('charge')
  async charge(@Body() body) {
    const { token, amount, email, user_id, payment_by, package_code } = body;

    const result = await this.omiseService.chargeCard(
      amount,
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

  @Post('/webhook')
  async handleWebhook(@Body() body: any) {
    await this.omiseService.webHookOmise(body);
    return { received: true };
  }
}
