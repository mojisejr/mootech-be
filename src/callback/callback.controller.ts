import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Headers,
  HttpStatus,
  Get,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Controller('callback')
export class CallBackController {
  @Get()
  getHello(): any {
    return { status: 200 };
  }

  @Post('omise')
  async handleWebhook(
    @Req() req,
    @Res() res,
    @Headers('X-Omise-Signature') signature: string,
    @Body() body: any,
  ) {
    const webhookSecret = process.env.OMISE_WEBHOOK_SECRET;

    // 1. Validate signature
    const computed = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (computed !== signature) {
      console.log('❌ INVALID SIGNATURE');
      return res.status(HttpStatus.FORBIDDEN).send('Invalid signature');
    }

    console.log('✔ VALID WEBHOOK RECEIVED');

    // 2. Extract event data
    const event = body;
    const eventType = event.key; // เช่น charge.create, charge.complete
    const charge = event.data;

    console.log('EVENT TYPE =', eventType);
    console.log('CHARGE ID  =', charge.id);
    console.log('STATUS     =', charge.status);

    // 3. Update payment status in DB
    // ---- ใส่ DB Logic ของคุณตรงนี้ ----
    // เช่น Prisma, TypeORM, Supabase

    // ตัวอย่าง pseudo-code:
    /*
    await this.paymentService.updatePaymentStatus({
      chargeId: charge.id,
      status: charge.status,
      amount: charge.amount,
      paidAt: charge.paid_at,
    });
    */

    // 4. Respond to Omise
    return res.status(200).json({ received: true });
  }
}
