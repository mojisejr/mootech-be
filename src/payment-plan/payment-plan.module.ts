import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { PaymentPlan } from './entity/payment-plan-entity.model';
import { PaymentPlanService } from './payment-plan.service';
@Module({
  imports: [TypeOrmModule.forFeature([PaymentPlan])],
  controllers: [],
  providers: [PaymentPlanService, MomentService],
  exports: [PaymentPlanService],
})
export class PaymentPlanModule {}
