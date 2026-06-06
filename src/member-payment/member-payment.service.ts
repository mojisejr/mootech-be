import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { MemberPayment } from './entity/member-payment-entity.model';
import { MemberPaymentLog } from './entity/member-payment-log-entity.model';
import { MemberPaymentCreateInput } from './dto/member-payment-create.input';
import { PaymentPlanService } from 'src/payment-plan/payment-plan.service';
import { PaymentPackageService } from 'src/payment-package/payment-package.service';
import { PaymentPlanGetInput } from 'src/payment-plan/dto/payment-plan-get.input';
import { MemberPaymentGetInput } from './dto/member-payment-get.input';
import { MemberPaymentGetAvailableInput } from './dto/member-payment-get-available.input';
import { UserProvider } from 'src/user-provider/entity/user-provider-entity.model';
import { UserProviderService } from 'src/user-provider/user-provider.service';
@Injectable()
export class MemberPaymentService {
  constructor(
    @Inject(forwardRef(() => PaymentPlanService))
    private readonly paymentPlanService: PaymentPlanService,
    @Inject(forwardRef(() => PaymentPackageService))
    private readonly paymentPackageService: PaymentPackageService,
    @Inject(forwardRef(() => UserProviderService))
    private readonly userProviderService: UserProviderService,
    @InjectRepository(MemberPayment)
    private readonly memberPaymentRepository: Repository<MemberPayment>,
    @InjectRepository(MemberPaymentLog)
    private readonly memberPaymentLogRepository: Repository<MemberPaymentLog>,
    private momentWrapper: MomentService,
  ) {}

  async createMemberPayment(_input: MemberPaymentCreateInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD');
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const planEntity = await this.paymentPlanService.getPaymentPlan({
      code: _input.plan_code,
    } as PaymentPlanGetInput);

    const packageEntity = await this.paymentPackageService.getPaymentPackage({
      code: _input.package_code,
    } as PaymentPlanGetInput);

    if (planEntity && packageEntity) {
      const expired = packageEntity.expire;
      const bufferDay = packageEntity.buffer_day;

      let expireDate = this.momentWrapper
        .momentDate(createAt)
        .add(bufferDay, 'days');
      const startDate = this.momentWrapper
        .momentDate(createAt)
        .add(bufferDay, 'days');

      // แยกตัวเลข กับ หน่วย
      const match = expired.match(/^(\d+)([DMY])$/);

      if (!match) {
        throw new Error(`Invalid expire format: ${expired}`);
      }

      const value = parseInt(match[1], 10);
      const unit = match[2];

      switch (unit) {
        case 'D':
          expireDate = expireDate.add(value, 'days');
          break;
        case 'M':
          expireDate = expireDate.add(value, 'months');
          break;
        case 'Y':
          expireDate = expireDate.add(value, 'years');
          break;
      }

      const expiredAt = expireDate.format('YYYY-MM-DD');
      console.log('match:', match);
      console.log('expiredAt:', expiredAt);

      const entity = new MemberPayment();
      entity.create_at = updateAt;
      entity.expire_at = expiredAt;
      entity.user_id = _input.user_id;
      entity.plan_code = _input.plan_code;
      entity.package_code = _input.package_code;
      entity.start_at = startDate.format('YYYY-MM-DD');
      const r = await this.memberPaymentRepository.save(entity);

      const entity2 = new MemberPaymentLog();
      entity2.create_at = updateAt;
      entity2.expire_at = expiredAt;
      entity2.user_id = _input.user_id;
      entity2.plan_code = _input.plan_code;
      entity2.package_code = _input.package_code;
      entity2.start_at = startDate.format('YYYY-MM-DD');
      entity2.payment_id = _input.payment_id;
      entity2.code = _input.code;
      const r2 = await this.memberPaymentLogRepository.save(entity2);
      console.log('r2', r2);
      return r;
    }
    return null;
  }

  async getMemberPayment(_input: MemberPaymentGetInput): Promise<any> {
    const result = await this.memberPaymentRepository.findOne({
      where: {
        user_id: _input.user_id,
      },
    });
    return result;
  }

  async getMemberPaymentAvailable(
    _input: MemberPaymentGetAvailableInput,
  ): Promise<any> {
    const today = this.momentWrapper.moment().format('YYYY-MM-DD');

    const qb = this.memberPaymentRepository
      .createQueryBuilder('mp')
      .leftJoinAndSelect(
        UserProvider,
        'user_provider',
        'user_provider.user_id = mp.user_id',
      )
      .andWhere('user_provider.provider = :provider', { provider: 'LINE' })
      .andWhere('mp.plan_code = :planCode', { planCode: _input.plan_code })
      .andWhere('mp.expire_at > :today', { today })
      .select(['user_provider', 'mp']);

    const result = await qb.getRawMany();
    return result;
  }

  async getMemberPaymentFree(day: number): Promise<any> {
    const result = await this.userProviderService.getUserProviderCreateAt(day);
    return result;
  }
}
