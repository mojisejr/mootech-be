import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { MemberPaymentCode } from './entity/member-payment-code-entity.model';
import { MemberPaymentCodeLog } from './entity/member-payment-code-log-entity.model';
import { MemberPaymentCodeService } from './member-payment-code.service';
import { PaymentCodeModule } from 'src/payment-code/payment-code.module';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
import { MemberPaymentCodeController } from './member-payment-code.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([MemberPaymentCode, MemberPaymentCodeLog]),
    PaymentCodeModule,
    MemberPaymentModule,
  ],
  controllers: [MemberPaymentCodeController],
  providers: [MemberPaymentCodeService, MomentService],
  exports: [MemberPaymentCodeService],
})
export class MemberPaymentCodeModule {}
