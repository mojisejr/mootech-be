import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { PaymentCodeCreateInput } from './dto/payment-code-create.input';
import { PaymentCode } from './entity/payment-code-entity.model';
import { PaymentCodeGetByCodeInput } from './dto/payment-code-get-by-code.input';
@Injectable()
export class PaymentCodeService {
  constructor(
    @InjectRepository(PaymentCode)
    private readonly paymentCodeRepository: Repository<PaymentCode>,
    private momentWrapper: MomentService,
  ) {}

  async createPaymentCode(_input: PaymentCodeCreateInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const code = this.generateCode();

    const userNewEntity = new PaymentCode();
    userNewEntity.create_at = createAt;
    userNewEntity.code = code;
    userNewEntity.plan_code = _input.plan_code;
    userNewEntity.package_code = _input.package_code;
    userNewEntity.description = _input.description;
    userNewEntity.expire = _input.expired;
    userNewEntity.max_use = _input.max_use;
    const result = await this.paymentCodeRepository.save(userNewEntity);
    return result;
  }

  async getPaymentCode(_input: PaymentCodeGetByCodeInput): Promise<any> {
    const userNewEntity = await this.paymentCodeRepository.findOne({
      where: {
        code: _input.code,
      },
    });
    return userNewEntity;
  }

  generateCode(length = 10) {
    return Array.from({ length }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26)),
    ).join('');
  }
}
