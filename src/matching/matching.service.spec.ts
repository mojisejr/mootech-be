// Teeth on the ดวงสมพงศ์ (matching) free ceiling raised 1 → 100 (#20, ฟีมเคาะ 2026-08-13).
// isCheckUsage is called in production as isCheckUsage(user_id, MATCHING_LIMIT.FREE) (matching.service.ts
// :104-106), so the spec passes the REAL enum value — reverting MATCHING_LIMIT.FREE back to 1 turns
// "free at 99 -> SUCCESS" red. Real MomentService (thin moment-timezone wrapper) keeps date logic honest;
// only the DB count + membership lookup are mocked.
import { MatchingService } from './matching.service';
import { MATCHING_LIMIT } from 'src/constants/matching-limit';
import { AI_CODE_RESPONSE } from 'src/constants/ai-code-response';
import { MomentService } from 'src/utils/MomentService';

const makeService = (overrides: any = {}) => {
  const userMatchingRepository = {
    count: jest.fn().mockResolvedValue(overrides.count ?? 0),
  };
  const memberPaymentService = {
    getMemberPayment: jest
      .fn()
      .mockResolvedValue(overrides.memberPayment ?? null), // null = FREE user
  };
  const momentWrapper = new MomentService();
  const svc = new MatchingService(
    userMatchingRepository as any,
    {} as any, // logMatchingRepository — unused by isCheckUsage
    {} as any, // userService
    memberPaymentService as any,
    {} as any, // memberWithFriendService
    {} as any, // chineseHoroscopeController
    momentWrapper as any,
  );
  return { svc, userMatchingRepository, memberPaymentService };
};

describe('MatchingService.isCheckUsage — ดวงสมพงศ์ free ceiling 1 → 100 (#20)', () => {
  it('free user who used 99 -> SUCCESS (was blocked at 1 before)', async () => {
    const { svc } = makeService({ count: 99 });
    const res = await svc.isCheckUsage('u-free', MATCHING_LIMIT.FREE);
    expect(res.code).toBe(AI_CODE_RESPONSE.SUCCESS);
    expect(res.is_free).toBe(true);
  });

  it('free user at the 100 ceiling -> OUT_OF_LIMIT', async () => {
    const { svc } = makeService({ count: 100 });
    const res = await svc.isCheckUsage('u-free', MATCHING_LIMIT.FREE);
    expect(res.code).toBe(AI_CODE_RESPONSE.OUT_OF_LIMIT);
    expect(res.is_free).toBe(true);
  });

  it('active member is never counted against the free ceiling -> SUCCESS even huge count', async () => {
    const { svc } = makeService({
      count: 99999,
      memberPayment: { plan_code: 'MEMBER', expire_at: '2099-01-01' },
    });
    const res = await svc.isCheckUsage('u-member', MATCHING_LIMIT.FREE);
    expect(res.code).toBe(AI_CODE_RESPONSE.SUCCESS);
    expect(res.is_free).toBe(false);
  });
});
