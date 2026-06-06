import { Module } from '@nestjs/common';
import { OmiseService } from './omise.service';
import { OmiseController } from './omise.controller';
import { PaymentModule } from 'src/payment/payment.module';
import { OmiseConfigModule } from 'src/config/omise';
import { PaymentPackageModule } from 'src/payment-package/payment-package.module';
import { PaymentPlanModule } from 'src/payment-plan/payment-plan.module';
@Module({
  imports: [
    PaymentModule,
    OmiseConfigModule,
    PaymentPackageModule,
    PaymentPlanModule,
  ],
  controllers: [OmiseController],
  providers: [OmiseService],
  exports: [OmiseService],
})
export class OmiseModule {}
