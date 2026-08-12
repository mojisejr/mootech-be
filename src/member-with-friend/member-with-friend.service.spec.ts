// Teeth on the เพิ่มเพื่อน free ceiling raised 1 → 20 (#20, ฟีมเคาะ 2026-08-13).
// createMemberWithFriend calls isCheckUsage(user_id, getLimit(true), getLimit(false)) — so getLimit is
// the single source of the free cap. Reverting getLimit's free branch back to 1 turns "free at 19 ->
// SUCCESS" red. Real MomentService; only DB count + membership lookup are mocked.
import { MemberWithFriendService } from './member-with-friend.service';
import { AI_CODE_RESPONSE } from 'src/constants/ai-code-response';
import { MomentService } from 'src/utils/MomentService';

const makeService = (overrides: any = {}) => {
  const memberWithFriendRepository = {
    count: jest.fn().mockResolvedValue(overrides.count ?? 0),
  };
  const memberPaymentService = {
    getMemberPayment: jest
      .fn()
      .mockResolvedValue(overrides.memberPayment ?? null), // null = FREE user
  };
  const momentWrapper = new MomentService();
  const svc = new MemberWithFriendService(
    {} as any, // userService
    memberWithFriendRepository as any,
    momentWrapper as any,
    memberPaymentService as any,
  );
  return { svc, memberWithFriendRepository, memberPaymentService };
};

describe('MemberWithFriendService — free friend ceiling 1 → 20 (#20)', () => {
  it('getLimit(true) (free) === 20', () => {
    const { svc } = makeService();
    expect(svc.getLimit(true)).toBe(20);
  });

  it('getLimit(false) (member) === 20 (unchanged)', () => {
    const { svc } = makeService();
    expect(svc.getLimit(false)).toBe(20);
  });

  it('free user with 19 friends -> can add (SUCCESS)', async () => {
    const { svc } = makeService({ count: 19 });
    const res = await svc.isCheckUsage(
      'u-free',
      svc.getLimit(true),
      svc.getLimit(false),
    );
    expect(res.code).toBe(AI_CODE_RESPONSE.SUCCESS);
    expect(res.is_free).toBe(true);
  });

  it('free user with 20 friends -> ตัน (OUT_OF_LIMIT)', async () => {
    const { svc } = makeService({ count: 20 });
    const res = await svc.isCheckUsage(
      'u-free',
      svc.getLimit(true),
      svc.getLimit(false),
    );
    expect(res.code).toBe(AI_CODE_RESPONSE.OUT_OF_LIMIT);
    expect(res.is_free).toBe(true);
  });

  it('active member with 19 -> SUCCESS (member ceiling untouched)', async () => {
    const { svc } = makeService({
      count: 19,
      memberPayment: { plan_code: 'MEMBER', expire_at: '2099-01-01' },
    });
    const res = await svc.isCheckUsage(
      'u-member',
      svc.getLimit(true),
      svc.getLimit(false),
    );
    expect(res.code).toBe(AI_CODE_RESPONSE.SUCCESS);
    expect(res.is_free).toBe(false);
  });
});
