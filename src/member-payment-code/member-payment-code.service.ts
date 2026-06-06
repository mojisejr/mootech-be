import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { MemberPaymentCodeCreateInput } from './dto/member-payment-code-create.input';
import { MemberPaymentCodeLog } from './entity/member-payment-code-log-entity.model';
import { MemberPaymentCode } from './entity/member-payment-code-entity.model';
import { MemberPaymentCodeAppendInput } from './dto/member-payment-code-append.input';
import { PaymentCodeService } from 'src/payment-code/payment-code.service';
import { PaymentCodeGetByCodeInput } from 'src/payment-code/dto/payment-code-get-by-code.input';
import { MemberPaymentService } from 'src/member-payment/member-payment.service';
import { MemberPaymentGetInput } from 'src/member-payment/dto/member-payment-get.input';
import { PaymentPackage } from 'src/constants/payment-package';
import { MemberPaymentCreateInput } from 'src/member-payment/dto/member-payment-create.input';
@Injectable()
export class MemberPaymentCodeService {
  constructor(
    @InjectRepository(MemberPaymentCode)
    private readonly memberPaymentCodeRepository: Repository<MemberPaymentCode>,
    @InjectRepository(MemberPaymentCodeLog)
    private readonly memberPaymentCodeLogRepository: Repository<MemberPaymentCodeLog>,
    private paymentCodeService: PaymentCodeService,
    private memberPaymentService: MemberPaymentService,
    private momentWrapper: MomentService,
  ) {}

  async createMemberPaymentCode(
    _input: MemberPaymentCodeCreateInput,
  ): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    let result = await this.memberPaymentCodeRepository.findOne({
      where: {
        user_id: _input.user_id,
      },
    });
    let log = null;
    if (!result) {
      result = new MemberPaymentCode();
      result.user_id = _input.user_id;
    } else {
      log = result;
    }

    result.owner_by = _input.owner_by;
    result.create_at = updateAt;
    result.code = _input.code;

    log = new MemberPaymentCodeLog();
    log.user_id = _input.user_id;
    log.owner_by = _input.owner_by;
    log.create_at = updateAt;
    log.code = _input.code;

    const r = await this.memberPaymentCodeRepository.save(result);
    log.member_payment_code_id = r.id;
    await this.memberPaymentCodeLogRepository.save(log);
    return r;
  }

  async appendMemberPaymentCode(
    _input: MemberPaymentCodeAppendInput,
  ): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    // CHECK CODE
    const paymentCode = await this.paymentCodeService.getPaymentCode({
      code: _input.code,
    } as PaymentCodeGetByCodeInput);
    if (!paymentCode) {
      return null;
    }

    console.log(paymentCode);

    const ownerCode = await this.memberPaymentCodeRepository.findOne({
      where: {
        code: _input.code,
      },
    });

    console.log(ownerCode);

    if (ownerCode.owner_by == _input.user_id) {
      return null;
    }
    const userInfo = await this.memberPaymentService.getMemberPayment({
      user_id: ownerCode.owner_by,
    } as MemberPaymentGetInput);
    // CHECK : EXPIRED
    const expiredCode = userInfo.expire_at;
    if (!this.isNotExpired(expiredCode)) {
      return null;
    }
    console.log(userInfo);
    // CHECK MAXIMUM
    const maxCode = paymentCode.max_use;
    // GET : ALL USE THIS CODE
    const totalUseThisCode = await this.memberPaymentCodeLogRepository.count({
      where: {
        code: _input.code,
      },
    });
    if (totalUseThisCode >= maxCode) {
      return null;
    }

    const log = new MemberPaymentCodeLog();
    log.member_payment_code_id = ownerCode.id;
    log.user_id = _input.user_id;
    log.create_at = updateAt;
    log.code = _input.code;
    const r = await this.memberPaymentCodeLogRepository.save(log);
    return r;
  }

  async checkMemberPaymentCode(
    _input: MemberPaymentCodeAppendInput,
  ): Promise<any> {
    console.log('checkMemberPaymentCode:');
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    // CHECK CODE
    const paymentCode = await this.paymentCodeService.getPaymentCode({
      code: _input.code,
    } as PaymentCodeGetByCodeInput);
    if (!paymentCode) {
      return null;
    }
    console.log('paymentCode:', paymentCode);

    let ownerCode = null;
    ownerCode = await this.memberPaymentCodeRepository.findOne({
      where: {
        code: _input.code,
      },
    });

    console.log('ownerCode:', ownerCode);

    if (
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_2 ||
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_3 ||
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_4 ||
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_5 ||
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_6 ||
      paymentCode.package_code == PaymentPackage.MEMBER_MONTHLY
    ) {
      if (!ownerCode || ownerCode.owner_by == _input.user_id) {
        console.log('ownerCode case null:');
        return null;
      }
    } else {
      const result = await this.memberPaymentCodeLogRepository.findOne({
        where: {
          code: _input.code,
          user_id: _input.user_id,
        },
      });
      console.log('ownerCode case result:', result);
      if (result) {
        return null;
      }
    }
    let userInfo = null;

    // CHECK MAXIMUM
    const maxCode = paymentCode.max_use;
    console.log('maxCode:', maxCode);
    // GET : ALL USE THIS CODE
    const totalUseThisCode = await this.memberPaymentCodeLogRepository.count({
      where: {
        code: _input.code,
      },
    });
    console.log('totalUseThisCode:', totalUseThisCode);
    if (totalUseThisCode > maxCode) {
      return null;
    }

    if (
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_2 ||
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_3 ||
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_4 ||
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_5 ||
      paymentCode.package_code == PaymentPackage.MEMBER_FAMILY_6 ||
      paymentCode.package_code == PaymentPackage.MEMBER_MONTHLY
    ) {
      console.log('ownerCode final 0:');
      userInfo = await this.memberPaymentService.getMemberPayment({
        user_id: ownerCode.owner_by,
      } as MemberPaymentGetInput);

      // CHECK : EXPIRED
      const expiredCode = userInfo.expire_at;
      console.log('expiredCode:', expiredCode);
      if (!this.isNotExpired(expiredCode)) {
        return null;
      }
    } else {
      console.log('ownerCode final 1:');
      await this.memberPaymentService.createMemberPayment({
        user_id: _input.user_id,
        plan_code: paymentCode.plan_code,
        package_code: paymentCode.package_code,
        payment_id: '',
        code: _input.code,
      } as MemberPaymentCreateInput);

      ownerCode = await this.createMemberPaymentCode({
        user_id: _input.user_id,
        code: _input.code,
        owner_by: _input.user_id,
      } as MemberPaymentCodeCreateInput);
    }
    console.log('userInfo', userInfo);
    console.log('ownerCode', ownerCode);

    return ownerCode;
  }

  isNotExpired(expired: string): boolean {
    const expiredDate = this.momentWrapper.momentFromDate(expired);

    if (!expiredDate.isValid()) {
      console.log('INVALID expired:', expired);
      return false; // หรือ throw error ตามที่คุณต้องการ
    }

    const expiredDay = expiredDate.startOf('day');
    const today = this.momentWrapper.moment().startOf('day');

    console.log('expired:', expired);
    console.log('expiredDay:', expiredDay.format());
    console.log('today:', today.format());

    return today.isSameOrBefore(expiredDay);
  }
}
