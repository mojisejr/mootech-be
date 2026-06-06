import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentCreateInput } from './dto/payment-create.input';
import { PaymentGetInput } from './dto/payment-get.input';
import { PaymentApproveInput } from './dto/payment-approve.input';
import { PaymentRejectInput } from './dto/payment-reject.input';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(200)
  async createPayment(@Body() input: PaymentCreateInput): Promise<any> {
    return await this.paymentService.createPayment(input);
  }

  @Get()
  @HttpCode(200)
  async getPayment(@Query() input: PaymentGetInput): Promise<any> {
    return await this.paymentService.getPayment(input);
  }

  @Post('approve')
  @HttpCode(200)
  async approve(@Body() input: PaymentApproveInput): Promise<any> {
    return await this.paymentService.approve(input);
  }

  @Post('reject')
  @HttpCode(200)
  async reject(@Body() input: PaymentRejectInput): Promise<any> {
    return await this.paymentService.reject(input);
  }
}
