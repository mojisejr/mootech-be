import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { Payment } from './entity/payment-entity.model';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ObjectStorageModule } from 'src/object-storage/object-storage.module';
import { SendGridModule } from 'src/send-grid/send-grid.module';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
import { PaymentCodeModule } from 'src/payment-code/payment-code.module';
import { PaymentPackageModule } from 'src/payment-package/payment-package.module';
import { MemberPaymentCodeModule } from 'src/member-payment-code/member-payment-code.module';
import { MemberPayAsUseModule } from 'src/member-pay-as-use/member-pay-as-use.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    ObjectStorageModule,
    SendGridModule,
    PaymentCodeModule,
    MemberPaymentCodeModule,
    MemberPayAsUseModule,
    forwardRef(() => MemberPaymentModule),
    forwardRef(() => PaymentPackageModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, MomentService],
  exports: [PaymentService],
})
export class PaymentModule {}
