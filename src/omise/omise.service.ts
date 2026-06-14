import { Body, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import * as Omise from 'omise';
import { OmiseConfigService } from 'src/config/omise';
import { PaymentPackageService } from 'src/payment-package/payment-package.service';
import { PaymentPlanGetInput } from 'src/payment-plan/dto/payment-plan-get.input';
import { PaymentPlanService } from 'src/payment-plan/payment-plan.service';
import { PaymentCreateViaOmiseInput } from 'src/payment/dto/payment-create-via-omise.input';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class OmiseService {
  private omise: any;

  constructor(
    private paymentService: PaymentService,
    private paymentPlanService: PaymentPlanService,
    private paymentPackageService: PaymentPackageService,
    private omiseConfigService: OmiseConfigService,
  ) {
    this.omise = Omise({
      publicKey: this.omiseConfigService.publicKey,
      secretKey: this.omiseConfigService.secret,
    });
  }

  // ▶ สร้าง charge ด้วย token (Credit/Debit)
  async createCardCharge(amount: number, token: string) {
    return await this.omise.charges.create({
      amount: amount * 100, // หน่วยเป็น "สตางค์"
      currency: 'thb',
      card: token,
      return_uri: 'http://localhost:3001/payment/redirect',
    });
  }

  // ▶ สร้าง PromptPay QR
  async createPromptPay(
    amount: number,
    email: string,
    user_id: string,
    payment_by: string,
    package_code: string,
  ) {
    // 1) Create source
    const source = await this.omise.sources.create({
      type: 'promptpay',
      amount: amount * 100,
      currency: 'thb',
    });
    const orderId = Array.from({ length: 10 }, () => randomInt(0, 10)).join('');

    const packageInfo = await this.paymentPackageService.getPaymentPackage({
      code: package_code,
    });
    let planInfo = null;
    if (packageInfo) {
      planInfo = await this.paymentPlanService.getPaymentPlan({
        code: packageInfo?.plan_code,
      } as PaymentPlanGetInput);
    }

    // 2) Create charge linked to source
    const charge = await this.omise.charges.create({
      amount: amount * 100,
      currency: 'thb',
      source: source.id,
      return_uri: this.omiseConfigService.returnUri,

      email: email,
      receipt: true,

      metadata: {
        orderId: orderId,
        packageName: packageInfo?.description,
        planName: planInfo?.description,
      },
    });
    const resultPayment = await this.paymentService.createPaymentViaOmise({
      user_id: user_id,
      email: email,
      payment: {
        package_code: package_code,
      },
      info: {
        charge_id: charge.id,
        order_id: orderId,
        payment_by: payment_by,
      },
    } as PaymentCreateViaOmiseInput);
    return charge;
  }

  // ▶ ดึงสถานะ Charge
  async retrieveCharge(chargeId: string) {
    return await this.omise.charges.retrieve(chargeId);
  }

  async chargeCard(
    amount: number,
    token: string,
    email: string,
    user_id: string,
    payment_by: string,
    package_code: string,
  ) {
    const orderId = Array.from({ length: 10 }, () => randomInt(0, 10)).join('');

    const packageInfo = await this.paymentPackageService.getPaymentPackage({
      code: package_code,
    });
    let planInfo = null;
    if (packageInfo) {
      planInfo = await this.paymentPlanService.getPaymentPlan({
        code: packageInfo?.plan_code,
      } as PaymentPlanGetInput);
    }

    try {
      const result = await this.omise.charges.create({
        amount: Math.round(amount * 100),
        currency: 'thb',
        card: token,
        return_uri: this.omiseConfigService.returnUri,

        email: email,
        receipt: true,

        metadata: {
          orderId: orderId,
          packageName: packageInfo?.description,
          planName: planInfo?.description,
        },
      });
      // SAVE TO PAYMENT
      /*
        - PAYMENT_BY
        - OMISE_REF_ID
        - user_id
        - Email
        - 
      */
      const resultPayment = await this.paymentService.createPaymentViaOmise({
        user_id: user_id,
        email: email,
        payment: {
          package_code: package_code,
        },
        info: {
          charge_id: result.id,
          order_id: orderId,
          payment_by: payment_by,
        },
      } as PaymentCreateViaOmiseInput);
      return result;
    } catch (error: any) {
      console.log('Omise error:', error.code);
      console.log('Omise message:', error.message);
      throw error;
    }
  }

  async webHookOmise(@Body() event: any) {
    if (event.key === 'charge.complete') {
      const charge = event.data;
      const orderId = charge.metadata?.orderId;

      if (charge.status === 'successful' && charge.paid === true) {
        // update order เป็น PAID
        const resultPayment = await this.paymentService.getPaymentByOrderId(
          orderId,
        );
        await this.paymentService.approve({
          approve_by: '',
          payment_id: resultPayment.id,
        });
      } else {
        // update order เป็น FAILED
        const resultPayment = await this.paymentService.getPaymentByOrderId(
          orderId,
        );
        await this.paymentService.reject({
          approve_by: '3e8fcda2-17dd-4c21-8b32-2470a07c5e04',
          payment_id: resultPayment.id,
          note: charge?.failure_message,
        });
      }
    } else if (event.key === 'charge.create') {
      const charge = event.data;
      const orderId = charge.metadata?.orderId;
      if (charge.status === 'failed') {
        // fail ทันที
        const resultPayment = await this.paymentService.getPaymentByOrderId(
          orderId,
        );
        await this.paymentService.reject({
          approve_by: '3e8fcda2-17dd-4c21-8b32-2470a07c5e04',
          payment_id: resultPayment.id,
          note: charge?.failure_message,
        });
      }

      if (charge.status === 'pending') {
        // รอ 3DS / รอ scan
      }
    }

    return { received: true };
  }
}
