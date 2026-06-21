import * as crypto from 'crypto';
import { OmiseService } from './omise.service';

// Avoid touching the real Omise SDK (constructor instantiates a client).
jest.mock('omise', () => jest.fn(() => ({ charges: {}, sources: {} })));

describe('OmiseService — webhook security (#mootech-omise-payment-hardening)', () => {
  const WEBHOOK_SECRET_B64 = Buffer.from('unit-test-secret-key').toString(
    'base64',
  );

  const makeService = (overrides: any = {}) => {
    const paymentService = {
      getPaymentByOrderId: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
      createPaymentViaOmise: jest.fn().mockResolvedValue({ id: 'pay1' }),
      ...(overrides.paymentService || {}),
    };
    const paymentPackageService = {
      getPaymentPackage: jest.fn(),
      ...(overrides.paymentPackageService || {}),
    };
    const paymentPlanService = {
      getPaymentPlan: jest.fn().mockResolvedValue({ description: 'plan' }),
      ...(overrides.paymentPlanService || {}),
    };
    const omiseConfigService = {
      publicKey: 'pkey_test_x',
      secret: 'skey_test_x',
      returnUri: 'https://example.test/payment/thankyou',
      webhookSecret: WEBHOOK_SECRET_B64,
      ...(overrides.omiseConfigService || {}),
    };
    const svc = new OmiseService(
      paymentService as any,
      paymentPlanService as any,
      paymentPackageService as any,
      omiseConfigService as any,
    );
    // Controllable Omise client (constructor's mock has no charges.create).
    const charges = { create: jest.fn().mockResolvedValue({ id: 'chg1' }) };
    const sources = { create: jest.fn().mockResolvedValue({ id: 'src1' }) };
    (svc as any).omise = { charges, sources };
    return { svc, paymentService, paymentPackageService, charges, sources };
  };

  // Mirror the exact Opn scheme: HMAC-SHA256 over `<ts>.<rawBody>`, base64 secret, hex.
  const sign = (secretB64: string, timestamp: string, rawBody: Buffer) =>
    crypto
      .createHmac('sha256', Buffer.from(secretB64, 'base64'))
      .update(Buffer.concat([Buffer.from(`${timestamp}.`, 'utf8'), rawBody]))
      .digest('hex');

  const completeEvent = (orderId: string) => ({
    key: 'charge.complete',
    data: { status: 'successful', paid: true, metadata: { orderId } },
  });

  describe('verifyWebhookSignature', () => {
    it('accepts a correctly signed payload', () => {
      const { svc } = makeService();
      const body = Buffer.from(JSON.stringify({ key: 'charge.complete' }));
      const ts = '1700000000';
      expect(
        svc.verifyWebhookSignature(
          body,
          sign(WEBHOOK_SECRET_B64, ts, body),
          ts,
        ),
      ).toBe(true);
    });

    it('rejects a tampered body', () => {
      const { svc } = makeService();
      const body = Buffer.from(JSON.stringify({ amount: 49900 }));
      const ts = '1700000000';
      const sig = sign(WEBHOOK_SECRET_B64, ts, body);
      const tampered = Buffer.from(JSON.stringify({ amount: 100 }));
      expect(svc.verifyWebhookSignature(tampered, sig, ts)).toBe(false);
    });

    it('rejects a mismatched timestamp', () => {
      const { svc } = makeService();
      const body = Buffer.from('{}');
      const sig = sign(WEBHOOK_SECRET_B64, '1700000000', body);
      expect(svc.verifyWebhookSignature(body, sig, '1700000999')).toBe(false);
    });

    it('fails closed when no secret is configured', () => {
      const { svc } = makeService({
        omiseConfigService: { webhookSecret: undefined },
      });
      const body = Buffer.from('{}');
      expect(svc.verifyWebhookSignature(body, 'anything', '1700000000')).toBe(
        false,
      );
    });

    it('fails closed on missing signature/timestamp/body', () => {
      const { svc } = makeService();
      expect(svc.verifyWebhookSignature(Buffer.from('{}'), '', '')).toBe(false);
      expect(svc.verifyWebhookSignature(Buffer.alloc(0), 'x', '1')).toBe(false);
    });
  });

  describe('handleWebhook', () => {
    it('throws Unauthorized on invalid signature (never reaches DB)', async () => {
      const { svc, paymentService } = makeService();
      const body = Buffer.from(JSON.stringify(completeEvent('o1')));
      await expect(
        svc.handleWebhook(body, 'forged', '1700000000'),
      ).rejects.toThrow();
      expect(paymentService.getPaymentByOrderId).not.toHaveBeenCalled();
    });

    it('verifies, parses, and dispatches a valid event', async () => {
      const { svc, paymentService } = makeService();
      paymentService.getPaymentByOrderId.mockResolvedValue({
        id: 'p1',
        status: 'WAIT',
      });
      const body = Buffer.from(JSON.stringify(completeEvent('o1')));
      const ts = '1700000000';
      const res = await svc.handleWebhook(
        body,
        sign(WEBHOOK_SECRET_B64, ts, body),
        ts,
      );
      expect(res).toEqual({ received: true });
      expect(paymentService.approve).toHaveBeenCalledWith({
        approve_by: expect.any(String),
        payment_id: 'p1',
      });
    });
  });

  describe('webHookOmise idempotency', () => {
    it('approves a fresh (WAIT) payment', async () => {
      const { svc, paymentService } = makeService();
      paymentService.getPaymentByOrderId.mockResolvedValue({
        id: 'p1',
        status: 'WAIT',
      });
      await svc.webHookOmise(completeEvent('o1'));
      expect(paymentService.approve).toHaveBeenCalledTimes(1);
    });

    it('skips approve when payment is already APPROVED (re-delivery)', async () => {
      const { svc, paymentService } = makeService();
      paymentService.getPaymentByOrderId.mockResolvedValue({
        id: 'p1',
        status: 'APPROVED',
      });
      await svc.webHookOmise(completeEvent('o1'));
      expect(paymentService.approve).not.toHaveBeenCalled();
    });

    it('skips settling unknown orders', async () => {
      const { svc, paymentService } = makeService();
      paymentService.getPaymentByOrderId.mockResolvedValue(null);
      await svc.webHookOmise(completeEvent('missing'));
      expect(paymentService.approve).not.toHaveBeenCalled();
      expect(paymentService.reject).not.toHaveBeenCalled();
    });
  });

  describe('server-side amount derivation', () => {
    it('charges the PACKAGE price in satang, never a client value', async () => {
      const { svc, paymentPackageService, charges } = makeService();
      paymentPackageService.getPaymentPackage.mockResolvedValue({
        package_code: 'SOULMATE',
        plan_code: 'MEMBER',
        amount: 499, // baht
        description: 'Soulmate',
      });
      await svc.chargeCard('tok_x', 'a@b.co', 'u1', 'CREDIT_CARD', 'SOULMATE');
      expect(charges.create).toHaveBeenCalledTimes(1);
      expect(charges.create.mock.calls[0][0].amount).toBe(49900); // 499 * 100
    });

    it('promptpay source + charge both use the package satang amount', async () => {
      const { svc, paymentPackageService, charges, sources } = makeService();
      paymentPackageService.getPaymentPackage.mockResolvedValue({
        package_code: 'TOPUP60',
        plan_code: 'TOPUP',
        amount: 60,
        description: 'Topup',
      });
      await svc.createPromptPay('a@b.co', 'u1', 'PROMPTPAY', 'TOPUP60');
      expect(sources.create.mock.calls[0][0].amount).toBe(6000);
      expect(charges.create.mock.calls[0][0].amount).toBe(6000);
    });

    it('rejects an unknown package before creating any charge', async () => {
      const { svc, paymentPackageService, charges } = makeService();
      paymentPackageService.getPaymentPackage.mockResolvedValue(null);
      await expect(
        svc.chargeCard('tok_x', 'a@b.co', 'u1', 'CREDIT_CARD', 'NOPE'),
      ).rejects.toThrow();
      expect(charges.create).not.toHaveBeenCalled();
    });

    it('rejects a package with non-positive amount', async () => {
      const { svc, paymentPackageService, charges } = makeService();
      paymentPackageService.getPaymentPackage.mockResolvedValue({
        package_code: 'BROKEN',
        amount: 0,
      });
      await expect(
        svc.chargeCard('tok_x', 'a@b.co', 'u1', 'CREDIT_CARD', 'BROKEN'),
      ).rejects.toThrow();
      expect(charges.create).not.toHaveBeenCalled();
    });
  });
});
