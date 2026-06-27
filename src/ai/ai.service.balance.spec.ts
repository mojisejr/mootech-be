import { AiService } from './ai.service';

// Focused spec for the wallet balance resolver (#mootech-chat-credit-wallet).
const makeService = (overrides: any = {}) => {
  const logAIRepository = {
    count: jest.fn().mockResolvedValue(0),
    ...(overrides.logAIRepository || {}),
  };
  const userService = {};
  const logCalculateService = {};
  const memberPaymentService = {
    getMemberPayment: jest.fn().mockResolvedValue(null),
    ...(overrides.memberPaymentService || {}),
  };
  const memberPayAsUseService = {
    getMemberPayAsUse: jest.fn().mockResolvedValue(null),
    upsertBalance: jest.fn().mockResolvedValue({}),
    ...(overrides.memberPayAsUseService || {}),
  };
  // isNotExpired uses momentFromDate(expire).startOf('day') vs moment().startOf('day').
  // `notExpired` controls whether today isSameOrBefore the expiry day.
  const notExpired = overrides.notExpired ?? true;
  const momentWrapper = {
    momentFromDate: () => ({
      isValid: () => true,
      startOf: () => ({ format: () => 'EXPIRY_DAY' }),
    }),
    moment: () => ({
      startOf: () => ({
        format: () => 'TODAY',
        isSameOrBefore: () => notExpired,
      }),
    }),
  };
  const httpService = {};
  const svc = new AiService(
    logAIRepository as any,
    userService as any,
    logCalculateService as any,
    memberPaymentService as any,
    memberPayAsUseService as any,
    momentWrapper as any,
    httpService as any,
  );
  return { svc, logAIRepository, memberPaymentService, memberPayAsUseService };
};

describe('AiService.getBalanceInfo (#mootech-chat-credit-wallet)', () => {
  it('active MEMBER (not expired) → unlimited, wallet untouched', async () => {
    const { svc, memberPayAsUseService } = makeService({
      memberPaymentService: {
        getMemberPayment: jest
          .fn()
          .mockResolvedValue({ plan_code: 'MEMBER', expire_at: '2999-01-01' }),
      },
    });
    const res = await svc.getBalanceInfo('vip');
    expect(res).toEqual({ isMember: true, unlimited: true, balance: 0 });
    expect(memberPayAsUseService.getMemberPayAsUse).not.toHaveBeenCalled();
  });

  it('existing wallet row → returns its stored balance', async () => {
    const { svc } = makeService({
      memberPayAsUseService: {
        getMemberPayAsUse: jest.fn().mockResolvedValue({ balance: 4 }),
        upsertBalance: jest.fn(),
      },
    });
    const res = await svc.getBalanceInfo('u1');
    expect(res).toEqual({ isMember: false, unlimited: false, balance: 4 });
  });

  it('no row, no usage → grants welcome 3 and seeds the wallet', async () => {
    const { svc, memberPayAsUseService } = makeService({
      logAIRepository: { count: jest.fn().mockResolvedValue(0) },
    });
    const res = await svc.getBalanceInfo('new');
    expect(res.balance).toBe(3);
    expect(memberPayAsUseService.upsertBalance).toHaveBeenCalledWith('new', 3);
  });

  it('no row but legacy overflow usage → backfills max(0, 3 − used)', async () => {
    const { svc, memberPayAsUseService } = makeService({
      logAIRepository: { count: jest.fn().mockResolvedValue(5) },
    });
    const res = await svc.getBalanceInfo('legacy');
    expect(res.balance).toBe(0);
    expect(memberPayAsUseService.upsertBalance).toHaveBeenCalledWith(
      'legacy',
      0,
    );
  });
});
