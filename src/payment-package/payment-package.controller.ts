import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { PaymentPackageService } from './payment-package.service';
import { PaymentPackageGetInput } from './dto/payment-package-get.input';

@Controller('payment-package')
export class PaymentPackageController {
  constructor(private readonly paymentPackageService: PaymentPackageService) {}

  @Get()
  @HttpCode(200)
  async getPaymentPackage(
    @Query() input: PaymentPackageGetInput,
  ): Promise<any> {
    return await this.paymentPackageService.getPaymentPackage(input);
  }
}
