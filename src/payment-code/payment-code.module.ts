import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { PaymentCode } from './entity/payment-code-entity.model';
import { PaymentCodeService } from './payment-code.service';
@Module({
  imports: [TypeOrmModule.forFeature([PaymentCode])],
  controllers: [],
  providers: [PaymentCodeService, MomentService],
  exports: [PaymentCodeService],
})
export class PaymentCodeModule {}
