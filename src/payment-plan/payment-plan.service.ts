import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { PaymentPlan } from './entity/payment-plan-entity.model';
import { PaymentPlanGetInput } from './dto/payment-plan-get.input';
@Injectable()
export class PaymentPlanService {
  constructor(
    @InjectRepository(PaymentPlan)
    private readonly paymentRepository: Repository<PaymentPlan>,
    private momentWrapper: MomentService,
  ) {}

  async getPaymentPlan(_input: PaymentPlanGetInput): Promise<any> {
    const result = await this.paymentRepository.findOne({
      where: {
        plan_code: _input.code,
      },
    });
    return result;
  }
}
