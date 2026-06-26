import { HttpException } from '@nestjs/common';
import { AiService } from './ai.service';

// Phase 2 — wallet gate + consume endpoint logic (#mootech-chat-credit-wallet).
const makeService = (overrides: any = {}) => {
  const logAIRepository = {
    count: jest.fn().mockResolvedValue(0),
    ...(overrides.logAIRepository || {}),
  };
  const memberPaymentService = {
    getMemberPayment: jest.fn().mockResolvedValue(null),
    ...(overrides.memberPaymentService || {}),
  };
  const memberPayAsUseService = {
    getMemberPayAsUse: jest.fn().mockResolvedValue(null),
    upsertBalance: jest.fn().mockResolvedValue({}),
    consume: jest.fn().mockResolvedValue({ ok: true, balance: 0 }),
    ...(overrides.memberPayAsUseService || {}),
  };
  const momentWrapper = {
    momentFromDate: () => ({
      isValid: () => true,
      startOf: () => ({ format: () => 'EXP' }),
    }),
    moment: () => ({
      startOf: () => ({ format: () => 'TODAY', isSameOrBefore: () => true }),
    }),
  };
  const svc = new AiService(
    logAIRepository as any,
    {} as any,
    {} as any,
    memberPaymentService as any,
    memberPayAsUseService as any,
    momentWrapper as any,
    {} as any,
  );
  return { svc, memberPayAsUseService };
};

describe('AiService — wallet gate (#mootech-chat-credit-wallet)', () => {
  const ENF = process.env.CREDIT_ENFORCE;
  afterEach(() => {
    if (ENF === undefined) delete process.env.CREDIT_ENFORCE;
    else process.env.CREDIT_ENFORCE = ENF;
  });

  it('balance > 0 → allowed', async () => {
    process.env.CREDIT_ENFORCE = 'on';
    const { svc } = makeService({
      memberPayAsUseService: {
        getMemberPayAsUse: jest.fn().mockResolvedValue({ balance: 2 }),
      },
    });
    const g = await svc.checkWalletGate('u1');
    expect(g.allowed).toBe(true);
    expect(g.balance).toBe(2);
  });

  it('enforce on + balance 0 → blocked (OUT_OF_LIMIT)', async () => {
    process.env.CREDIT_ENFORCE = 'on';
    const { svc } = makeService({
      memberPayAsUseService: {
        getMemberPayAsUse: jest.fn().mockResolvedValue({ balance: 0 }),
      },
    });
    const g = await svc.checkWalletGate('u1');
    expect(g.allowed).toBe(false);
    expect(g.code).toBe(404); // AI_CODE_RESPONSE.OUT_OF_LIMIT
  });

  it('enforce OFF + balance 0 → allowed (counter-only mode)', async () => {
    process.env.CREDIT_ENFORCE = 'off';
    const { svc } = makeService({
      memberPayAsUseService: {
        getMemberPayAsUse: jest.fn().mockResolvedValue({ balance: 0 }),
      },
    });
    const g = await svc.checkWalletGate('u1');
    expect(g.allowed).toBe(true);
  });

  it('active member → unlimited regardless of enforce', async () => {
    process.env.CREDIT_ENFORCE = 'on';
    const { svc } = makeService({
      memberPaymentService: {
        getMemberPayment: jest
          .fn()
          .mockResolvedValue({ plan_code: 'MEMBER', expire_at: '2999-01-01' }),
      },
    });
    const g = await svc.checkWalletGate('vip');
    expect(g.allowed).toBe(true);
    expect(g.unlimited).toBe(true);
  });
});

describe('AiService.consumeCredit — secret guard (#mootech-chat-credit-wallet)', () => {
  const SECRET = process.env.AI_CONSUME_SECRET;
  afterEach(() => {
    if (SECRET === undefined) delete process.env.AI_CONSUME_SECRET;
    else process.env.AI_CONSUME_SECRET = SECRET;
  });

  it('wrong secret → 401', async () => {
    process.env.AI_CONSUME_SECRET = 'right';
    const { svc } = makeService();
    await expect(svc.consumeCredit('u1', 'wrong')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('missing server secret → 401 (fail closed)', async () => {
    delete process.env.AI_CONSUME_SECRET;
    const { svc } = makeService();
    await expect(svc.consumeCredit('u1', 'anything')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('correct secret + non-member → spends one credit', async () => {
    process.env.AI_CONSUME_SECRET = 'right';
    const { svc, memberPayAsUseService } = makeService({
      memberPayAsUseService: {
        getMemberPayAsUse: jest.fn().mockResolvedValue({ balance: 3 }),
        consume: jest.fn().mockResolvedValue({ ok: true, balance: 2 }),
      },
    });
    const res = await svc.consumeCredit('u1', 'right');
    expect(res).toEqual({ ok: true, unlimited: false, balance: 2 });
    expect(memberPayAsUseService.consume).toHaveBeenCalledWith('u1');
  });

  it('correct secret + member → unlimited, not charged', async () => {
    process.env.AI_CONSUME_SECRET = 'right';
    const { svc, memberPayAsUseService } = makeService({
      memberPaymentService: {
        getMemberPayment: jest
          .fn()
          .mockResolvedValue({ plan_code: 'MEMBER', expire_at: '2999-01-01' }),
      },
    });
    const res = await svc.consumeCredit('vip', 'right');
    expect(res).toEqual({ ok: true, unlimited: true, balance: 0 });
    expect(memberPayAsUseService.consume).not.toHaveBeenCalled();
  });
});
