import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { MemberPayment } from './entity/member-payment-entity.model';
import { MemberPaymentLog } from './entity/member-payment-log-entity.model';
import { PaymentPlanModule } from 'src/payment-plan/payment-plan.module';
import { PaymentPackageModule } from 'src/payment-package/payment-package.module';
import { MemberPaymentService } from './member-payment.service';
import { UserProviderModule } from 'src/user-provider/user-provider.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([MemberPayment, MemberPaymentLog]),
    forwardRef(() => PaymentPlanModule),
    forwardRef(() => PaymentPackageModule),
    forwardRef(() => UserProviderModule),
  ],
  controllers: [],
  providers: [MemberPaymentService, MomentService],
  exports: [MemberPaymentService],
})
export class MemberPaymentModule {}
