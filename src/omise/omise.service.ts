import {
  Body,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { randomInt } from 'crypto';
import * as Omise from 'omise';
import { OmiseConfigService } from 'src/config/omise';
import { PaymentPackageService } from 'src/payment-package/payment-package.service';
import { PaymentPlanGetInput } from 'src/payment-plan/dto/payment-plan-get.input';
import { PaymentPlanService } from 'src/payment-plan/payment-plan.service';
import { PaymentCreateViaOmiseInput } from 'src/payment/dto/payment-create-via-omise.input';
import { PaymentService } from 'src/payment/payment.service';

// System actor recorded as approve_by when the Omise webhook (not a human admin)
// settles a payment. Was previously a hardcoded UUID literal at each call site.
const SYSTEM_ACTOR_ID = '3e8fcda2-17dd-4c21-8b32-2470a07c5e04';

// Terminal payment statuses — once reached, webhook re-deliveries are ignored
// (Omise retries on non-2xx, so handling must be idempotent).
const TERMINAL_STATUSES = ['APPROVED', 'REJECT'];

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

  // Resolve the authoritative charge amount from the package on the SERVER.
  // The client never sends an amount — it only names a package_code — so a user
  // cannot pay 1 THB for a 499 THB package. Unknown/invalid packages are rejected
  // before any Omise charge is created. Returns satang (integer).
  // (#mootech-omise-payment-hardening)
  private async resolvePackageCharge(
    package_code: string,
  ): Promise<{ packageInfo: any; amountSatang: number }> {
    const packageInfo = await this.paymentPackageService.getPaymentPackage({
      code: package_code,
    });
    const amount = Number(packageInfo?.amount);
    if (!packageInfo || !Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Unknown or invalid package_code');
    }
    return { packageInfo, amountSatang: Math.round(amount * 100) };
  }

  // ▶ สร้าง PromptPay QR (amount derived server-side from package_code)
  async createPromptPay(
    email: string,
    user_id: string,
    payment_by: string,
    package_code: string,
  ) {
    const { packageInfo, amountSatang } = await this.resolvePackageCharge(
      package_code,
    );

    // 1) Create source
    const source = await this.omise.sources.create({
      type: 'promptpay',
      amount: amountSatang,
      currency: 'thb',
    });
    const orderId = Array.from({ length: 10 }, () => randomInt(0, 10)).join('');

    let planInfo = null;
    if (packageInfo) {
      planInfo = await this.paymentPlanService.getPaymentPlan({
        code: packageInfo?.plan_code,
      } as PaymentPlanGetInput);
    }

    // 2) Create charge linked to source
    const charge = await this.omise.charges.create({
      amount: amountSatang,
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
    await this.paymentService.createPaymentViaOmise({
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
    token: string,
    email: string,
    user_id: string,
    payment_by: string,
    package_code: string,
  ) {
    const orderId = Array.from({ length: 10 }, () => randomInt(0, 10)).join('');

    const { packageInfo, amountSatang } = await this.resolvePackageCharge(
      package_code,
    );
    let planInfo = null;
    if (packageInfo) {
      planInfo = await this.paymentPlanService.getPaymentPlan({
        code: packageInfo?.plan_code,
      } as PaymentPlanGetInput);
    }

    try {
      const result = await this.omise.charges.create({
        amount: amountSatang,
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

  // ▶ Verify an incoming Omise webhook, then dispatch it.
  // Signature scheme (verified against https://docs.omise.co/api-webhooks):
  //   HMAC-SHA256( base64-decode(secret), `<Omise-Signature-Timestamp>.<raw body>` )
  //   compared (hex) against the `Omise-Signature` header in constant time.
  // The raw request body Buffer is required — a re-serialized JSON object would
  // not byte-match what Omise signed. Fails closed: no/bad secret/sig => reject.
  async handleWebhook(
    rawBody: Buffer,
    signature: string,
    timestamp: string,
  ): Promise<{ received: boolean }> {
    if (!this.verifyWebhookSignature(rawBody, signature, timestamp)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    let event: any;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid webhook body');
    }

    await this.webHookOmise(event);
    return { received: true };
  }

  verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
    timestamp: string,
  ): boolean {
    const secretB64 = this.omiseConfigService.webhookSecret;
    if (!secretB64 || !signature || !timestamp) return false;
    if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) return false;

    const secret = Buffer.from(secretB64, 'base64');
    const payload = Buffer.concat([
      Buffer.from(`${timestamp}.`, 'utf8'),
      rawBody,
    ]);
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  async webHookOmise(@Body() event: any) {
    if (event.key === 'charge.complete') {
      const charge = event.data;
      const orderId = charge.metadata?.orderId;

      if (charge.status === 'successful' && charge.paid === true) {
        // settle order as PAID (idempotent — skip if already terminal)
        const resultPayment = await this.resolveSettleablePayment(orderId);
        if (resultPayment) {
          await this.paymentService.approve({
            approve_by: SYSTEM_ACTOR_ID,
            payment_id: resultPayment.id,
          });
        }
      } else {
        // settle order as FAILED
        const resultPayment = await this.resolveSettleablePayment(orderId);
        if (resultPayment) {
          await this.paymentService.reject({
            approve_by: SYSTEM_ACTOR_ID,
            payment_id: resultPayment.id,
            note: charge?.failure_message,
          });
        }
      }
    } else if (event.key === 'charge.create') {
      const charge = event.data;
      const orderId = charge.metadata?.orderId;
      if (charge.status === 'failed') {
        // fail immediately
        const resultPayment = await this.resolveSettleablePayment(orderId);
        if (resultPayment) {
          await this.paymentService.reject({
            approve_by: SYSTEM_ACTOR_ID,
            payment_id: resultPayment.id,
            note: charge?.failure_message,
          });
        }
      }

      if (charge.status === 'pending') {
        // waiting for 3DS / QR scan — nothing to settle yet
      }
    }

    return { received: true };
  }

  // Look up the payment for an order and return it ONLY if it still needs
  // settling. Returns null for unknown orders or ones already APPROVED/REJECT,
  // so repeated Omise deliveries do not double-provision or double-email.
  private async resolveSettleablePayment(orderId: any): Promise<any | null> {
    if (!orderId) return null;
    const payment = await this.paymentService.getPaymentByOrderId(orderId);
    if (!payment) return null;
    if (TERMINAL_STATUSES.includes(payment.status)) return null;
    return payment;
  }
}
