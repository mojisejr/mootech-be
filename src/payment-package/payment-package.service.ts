import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { PaymentPackage } from './entity/payment-package-entity.model';
import { PaymentPackageGetInput } from './dto/payment-package-get.input';
@Injectable()
export class PaymentPackageService {
  constructor(
    @InjectRepository(PaymentPackage)
    private readonly paymentRepository: Repository<PaymentPackage>,
    private momentWrapper: MomentService,
  ) {}

  async getPaymentPackage(_input: PaymentPackageGetInput): Promise<any> {
    const result = await this.paymentRepository.findOne({
      where: {
        package_code: _input.code,
      },
    });
    return result;
  }
}
