import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { Payment } from './entity/payment-entity.model';
import { PaymentCreateInput } from './dto/payment-create.input';
import { PaymentGetInput } from './dto/payment-get.input';
import { GetIndexStartOfPage } from 'src/utils/calculate-page';
import { User } from 'src/user/entity/user-entity.model';
import { ObjectStorageService } from 'src/object-storage/object-storage.service';
import { PaymentRejectInput } from './dto/payment-reject.input';
import { PaymentApproveInput } from './dto/payment-approve.input';
import { SendGridService } from 'src/send-grid/send-grid.service';
import { SendGridSendEmailInput } from 'src/send-grid/dto/send-grid-email-input';
import { EMAIL_TEMPLATE } from 'src/constants/email-template';
import { PaymentPlan } from 'src/constants/payment-plan';
import { PaymentPackage } from 'src/constants/payment-package';
import { MemberPaymentService } from 'src/member-payment/member-payment.service';
import { MemberPaymentCreateInput } from 'src/member-payment/dto/member-payment-create.input';
import { PaymentCodeService } from 'src/payment-code/payment-code.service';
import { PaymentCodeCreateInput } from 'src/payment-code/dto/payment-code-create.input';
import { PaymentPackageService } from 'src/payment-package/payment-package.service';
import { PaymentPlanGetInput } from 'src/payment-plan/dto/payment-plan-get.input';
import { MemberPaymentCodeService } from 'src/member-payment-code/member-payment-code.service';
import { MemberPaymentCodeCreateInput } from 'src/member-payment-code/dto/member-payment-code-create.input';
import { MemberPaymentLog } from 'src/member-payment/entity/member-payment-log-entity.model';
import { PaymentCreateViaOmiseInput } from './dto/payment-create-via-omise.input';
import { MemberPayAsUseService } from 'src/member-pay-as-use/member-pay-as-use.service';
import { MemberPayAsUseCreateInput } from 'src/member-pay-as-use/dto/member-pay-as-use-create.input';
import { PaymentTopUp } from 'src/constants/payment-topup';
@Injectable()
export class PaymentService {
  constructor(
    @Inject(forwardRef(() => MemberPaymentService))
    private readonly memberPaymentService: MemberPaymentService,
    @Inject(forwardRef(() => PaymentPackageService))
    private readonly paymentPackageService: PaymentPackageService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private objectStorageService: ObjectStorageService,
    private sendGridService: SendGridService,
    private paymentCodeService: PaymentCodeService,
    private memberPaymentCodeService: MemberPaymentCodeService,
    private memberPayAsUseService: MemberPayAsUseService,
    private momentWrapper: MomentService,
  ) {}

  async createPayment(_input: PaymentCreateInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const userNewEntity = new Payment();
    userNewEntity.submit_at = createAt;
    userNewEntity.user_id = _input.user_id;
    userNewEntity.payment_plan = _input.payment.plan;
    userNewEntity.payment_package = _input.payment.package_code;
    userNewEntity.payment_package_name = _input.payment.package_name;
    userNewEntity.payment_amount = _input.payment.amount;
    userNewEntity.file = _input.slip.file;
    userNewEntity.date = _input.slip.date;
    userNewEntity.time = _input.slip.time;
    userNewEntity.amount = _input.slip.amount;
    userNewEntity.email = _input.email;
    const result = await this.paymentRepository.save(userNewEntity);
    return result;
  }

  async createPaymentViaOmise(
    _input: PaymentCreateViaOmiseInput,
  ): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const packageInfo = await this.paymentPackageService.getPaymentPackage({
      code: _input.payment.package_code,
    });

    const userNewEntity = new Payment();
    userNewEntity.submit_at = createAt;
    userNewEntity.user_id = _input.user_id;
    userNewEntity.payment_plan = packageInfo.plan_code;
    userNewEntity.payment_package = packageInfo.package_code;
    userNewEntity.payment_package_name = packageInfo.description;
    userNewEntity.payment_amount = packageInfo.amount;

    //SLIP
    userNewEntity.file = '';
    userNewEntity.date = '';
    userNewEntity.time = '';
    userNewEntity.amount = packageInfo.amount;

    userNewEntity.email = _input.email;
    userNewEntity.order_id = _input.info.order_id;
    userNewEntity.payment_by = _input.info.payment_by;
    userNewEntity.charge_id = _input.info.charge_id;
    const result = await this.paymentRepository.save(userNewEntity);
    return result;
  }

  async getPayment(_input: PaymentGetInput): Promise<any> {
    const start_index: number = GetIndexStartOfPage(
      _input.page,
      _input.per_page,
    );
    const end_index: number =
      parseInt(start_index + '') + parseInt(_input.per_page + '') - 1;

    const query = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('customer')
      .addSelect('report_type')
      .leftJoinAndSelect(User, 'user', 'user.user_id = payment.user_id')
      .leftJoinAndSelect(
        MemberPaymentLog,
        'member_payment_log',
        'member_payment_log.payment_id = payment.id',
      );

    if (_input.word && _input.word != '') {
      query.andWhere(
        `( user.name LIKE :word OR user.surname LIKE :word OR user.account_name LIKE :word ) OR
        ( payment.email LIKE :word ) 
        `,
        {
          word: `%${_input.word}%`,
        },
      );
    }

    if (_input.status && _input.status != '') {
      query.andWhere(
        `( payment.status = :status ) 
        `,
        {
          status: `${_input.status}`,
        },
      );
    }

    const queryTotal = query;
    const result_total = await queryTotal
      .select('COUNT(*)', 'total')
      .getRawOne();

    query.select('payment').addSelect('user').addSelect('member_payment_log');

    const r = await query
      .offset(start_index)
      .limit(_input.per_page)
      .orderBy('payment.submit_at', 'DESC')
      .getRawMany();

    console.log(r);

    const results: any[] = [];
    for (let i = 0; i < r.length; i++) {
      const raw = r[i];
      results.push({
        user: {
          name: raw.user_name,
          surname: raw.user_surname,
          picture_url: raw.user_picture_url,
          account_name: raw.user_account_name,
        },
        payment: {
          id: raw.payment_id,
          payment_plan: raw.payment_payment_plan,
          payment_package: raw.payment_payment_package,
          package_name: raw.payment_payment_package_name,
          payment_amount: raw.payment_payment_amount,
          file: raw.payment_file,
          date: raw.payment_date,
          time: raw.payment_time,
          amount: raw.payment_amount,
          status: raw.payment_status,
          note: raw.payment_note,
          submit_at: raw.payment_submit_at,
          approve_at: raw.payment_approve_at,
          approve_by: raw.payment_approve_by,
          email: raw.payment_email,
          payment_by: raw.payment_payment_by,
          charge_id: raw.payment_charge_id,
        },
        detail: {
          start_at: raw.member_payment_log_start_at,
          expire_at: raw.member_payment_log_expire_at,
          code: raw.member_payment_log_code,
        },
      });
    }
    return {
      page: _input.page,
      per_page: _input.per_page,
      start_index: start_index,
      end_index: end_index,
      total: result_total.total,
      data: results,
    };
  }

  async approve(_input: PaymentApproveInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const entity = await this.paymentRepository.findOne({
      where: {
        id: _input.payment_id,
      },
    });
    if (!entity) {
      return null;
    }
    // UPDATE
    entity.status = 'APPROVED';
    entity.approve_at = createAt;
    entity.approve_by = _input.approve_by;
    const resultPayment = await this.paymentRepository.save(entity);
    console.log('resultPayment', resultPayment);

    // SEND EMAIL
    let isFamilyPlan = false;
    let isMemberPlan = false;
    let isTopup = false;
    let promoCode = '';
    if (entity.payment_plan == PaymentPlan.MEMBER) {
      if (
        entity.payment_plan == PaymentPlan.MEMBER &&
        (entity.payment_package == PaymentPackage.MEMBER_FAMILY_2 ||
          entity.payment_package == PaymentPackage.MEMBER_FAMILY_3 ||
          entity.payment_package == PaymentPackage.MEMBER_FAMILY_4 ||
          entity.payment_package == PaymentPackage.MEMBER_FAMILY_5 ||
          entity.payment_package == PaymentPackage.MEMBER_FAMILY_6)
      ) {
        isFamilyPlan = true;
      } else {
        if (
          entity.payment_package == PaymentPackage.MEMBER_MONTHLY ||
          entity.payment_package == PaymentPackage.MEMBER_FREE ||
          entity.payment_package == PaymentPackage.SOULMATE
        ) {
          isMemberPlan = true;
        }

        try {
          await this.sendGridService.sendEmail({
            to: entity.email,
            templateId: EMAIL_TEMPLATE.SUCCESS,
            payload: {
              plan_name: entity.payment_package_name,
              paid_at: `${entity.date} ${entity.time}`,
              total_amount: entity.amount,
            },
          } as SendGridSendEmailInput);
        } catch (e) {}
      }
    } else if (entity.payment_plan == PaymentPlan.PAYASUSE) {
      isTopup = true;
      try {
        await this.sendGridService.sendEmail({
          to: entity.email,
          templateId: EMAIL_TEMPLATE.SUCCESS,
          payload: {
            plan_name: entity.payment_package_name,
            paid_at: `${entity.date} ${entity.time}`,
            total_amount: entity.amount,
          },
        } as SendGridSendEmailInput);
      } catch (e) {}
    }

    // INSERT OR UPDATE MEMBER_PLAN
    let resultMemberPayment = null;
    console.log('isMemberPlan', isMemberPlan);
    console.log('isFamilyPlan', isFamilyPlan);
    console.log('isTopup', isTopup);

    if (isFamilyPlan) {
      // GENERATE CODE
      const paymentPackageInfo =
        await this.paymentPackageService.getPaymentPackage({
          code: entity.payment_package,
        } as PaymentPlanGetInput);
      console.log('paymentPackageInfo', paymentPackageInfo);
      const paymentCodeInfo = await this.paymentCodeService.createPaymentCode({
        plan_code: entity.payment_plan,
        package_code: entity.payment_package,
        description: entity.payment_package_name,
        expired: paymentPackageInfo.expire,
        max_use: paymentPackageInfo.max_user,
      } as PaymentCodeCreateInput);
      console.log('paymentCodeInfo', paymentCodeInfo);
      // INSERT CODE;
      // INSERT LOG_CODE;
      const resultMemberPaymentCode =
        await this.memberPaymentCodeService.createMemberPaymentCode({
          user_id: entity.user_id,
          code: paymentCodeInfo.code,
          owner_by: entity.user_id,
        } as MemberPaymentCodeCreateInput);
      console.log('resultMemberPaymentCode', resultMemberPaymentCode);

      promoCode = paymentCodeInfo.code;

      if (isFamilyPlan) {
        try {
          await this.sendGridService.sendEmail({
            to: entity.email,
            templateId: EMAIL_TEMPLATE.SUCCESS_FAMILY_PLAN,
            payload: {
              plan_name: entity.payment_package_name,
              paid_at: `${entity.date} ${entity.time}`,
              total_amount: entity.amount,
              family_code: paymentCodeInfo.code,
            },
          } as SendGridSendEmailInput);
        } catch (e) {}
      }
    }

    if (isMemberPlan || isFamilyPlan) {
      //
      resultMemberPayment = await this.memberPaymentService.createMemberPayment(
        {
          user_id: entity.user_id,
          plan_code: entity.payment_plan,
          package_code: entity.payment_package,
          payment_id: entity.id,
          code: promoCode,
        } as MemberPaymentCreateInput,
      );
      console.log('resultMemberPayment', resultMemberPayment);
    }

    if (isTopup) {
      const paymentPackageInfo =
        await this.paymentPackageService.getPaymentPackage({
          code: entity.payment_package,
        } as PaymentPlanGetInput);
      let total = 3;
      if (paymentPackageInfo.package_code == PaymentTopUp.PAY_10Q) {
        total = 10;
      }
      console.log('paymentPackageInfo', paymentPackageInfo);
      console.log('entity', entity);

      await this.memberPayAsUseService.createMemberPayAsUse({
        user_id: entity.user_id,
        payment_id: entity.id,
        total: total,
      } as MemberPayAsUseCreateInput);
    }

    return null;
  }

  async reject(_input: PaymentRejectInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    // UPDATE
    const entity = await this.paymentRepository.findOne({
      where: {
        id: _input.payment_id,
      },
    });
    if (!entity) {
      return null;
    }

    entity.status = 'REJECT';
    entity.note = _input.note;
    entity.approve_at = createAt;
    entity.approve_by = _input.approve_by;
    await this.paymentRepository.save(entity);

    // SEND EMAIL
    await this.sendGridService.sendEmail({
      to: entity.email,
      templateId: EMAIL_TEMPLATE.REJECT,
      payload: {
        plan_name: entity.payment_package_name,
        paid_at: `${entity.date} ${entity.time}`,
        total_amount: entity.amount,
      },
    } as SendGridSendEmailInput);

    return null;
  }

  async getPaymentByOrderId(orderId: any): Promise<any> {
    const entity = await this.paymentRepository.findOne({
      where: {
        order_id: orderId,
      },
    });

    return entity;
  }
}
