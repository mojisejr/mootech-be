import { MemberPayAsUseService } from './member-pay-as-use.service';

// Plain-constructor mocks (mirrors the project's omise.service.spec style).
const makeService = (overrides: any = {}) => {
  const memberRepo = {
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation((e: any) => Promise.resolve(e)),
    query: jest.fn(),
    ...(overrides.memberRepo || {}),
  };
  const logRepo = {
    save: jest.fn().mockResolvedValue({}),
    ...(overrides.logRepo || {}),
  };
  const momentWrapper = {
    moment: () => ({ format: () => '2026-06-26 10:00:00' }),
  };
  const svc = new MemberPayAsUseService(
    memberRepo as any,
    logRepo as any,
    momentWrapper as any,
  );
  return { svc, memberRepo, logRepo };
};

describe('MemberPayAsUseService — wallet (#mootech-chat-credit-wallet)', () => {
  describe('createMemberPayAsUse (topup)', () => {
    it('first record → balance = welcome 3 + purchase, and logs the topup', () => {
      const { svc, logRepo } = makeService();
      return svc
        .createMemberPayAsUse({
          user_id: 'u1',
          payment_id: 'pay1',
          total: 3,
        } as any)
        .then((res: any) => {
          expect(res.total).toBe(3);
          expect(res.balance).toBe(6); // 3 welcome + 3 bought
          expect(logRepo.save).toHaveBeenCalledTimes(1);
        });
    });

    it('existing wallet → top-up is strictly additive (no welcome, no reset)', () => {
      const { svc } = makeService({
        memberRepo: {
          findOne: jest
            .fn()
            .mockResolvedValue({ user_id: 'u1', total: 3, balance: 6 }),
        },
      });
      return svc
        .createMemberPayAsUse({
          user_id: 'u1',
          payment_id: 'pay2',
          total: 10,
        } as any)
        .then((res: any) => {
          expect(res.total).toBe(13);
          expect(res.balance).toBe(16); // 6 + 10
        });
    });
  });

  describe('consume (atomic spend)', () => {
    it('decrements and returns the new balance when credits remain', async () => {
      const { svc, memberRepo } = makeService({
        memberRepo: { query: jest.fn().mockResolvedValue([{ balance: 5 }]) },
      });
      const res = await svc.consume('u1');
      expect(res).toEqual({ ok: true, balance: 5 });
      // guarded UPDATE with balance > 0 (no double-spend / no negative)
      const sql = memberRepo.query.mock.calls[0][0] as string;
      expect(sql).toMatch(/balance = balance - 1/);
      expect(sql).toMatch(/balance > 0/);
    });

    it('returns ok:false when nothing to spend (empty RETURNING)', async () => {
      const { svc } = makeService({
        memberRepo: { query: jest.fn().mockResolvedValue([]) },
      });
      const res = await svc.consume('u1');
      expect(res).toEqual({ ok: false, balance: 0 });
    });
  });

  describe('upsertBalance (welcome / backfill seed)', () => {
    it('creates a row with the seeded balance when none exists', async () => {
      const { svc, memberRepo } = makeService();
      const res = await svc.upsertBalance('new-user', 3);
      expect(res.balance).toBe(3);
      expect(res.total).toBe(0);
      expect(memberRepo.save).toHaveBeenCalledTimes(1);
    });

    it('is idempotent — never overwrites an existing wallet (welcome once)', async () => {
      const { svc, memberRepo } = makeService({
        memberRepo: {
          findOne: jest
            .fn()
            .mockResolvedValue({ user_id: 'u1', total: 0, balance: 1 }),
        },
      });
      const res = await svc.upsertBalance('u1', 3);
      expect(res.balance).toBe(1); // unchanged
      expect(memberRepo.save).not.toHaveBeenCalled();
    });
  });
});
