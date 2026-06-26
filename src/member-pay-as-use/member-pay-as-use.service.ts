import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { MemberPayAsUseCreateInput } from './dto/member-pay-as-use-create.input';
import { MemberPayAsUse } from './entity/member-payment-as-use-entity.model';
import { LogMemberPayAsUse } from './entity/log-member-payment-as-use-entity.model';
import { WELCOME_CREDITS } from './wallet.util';
@Injectable()
export class MemberPayAsUseService {
  constructor(
    @InjectRepository(MemberPayAsUse)
    private readonly memberPayAsUseRepository: Repository<MemberPayAsUse>,
    @InjectRepository(LogMemberPayAsUse)
    private readonly logMemberPayAsUseRepository: Repository<LogMemberPayAsUse>,
    private momentWrapper: MomentService,
  ) {}

  async createMemberPayAsUse(_input: MemberPayAsUseCreateInput): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const log = new LogMemberPayAsUse();
    log.create_at = updateAt;
    log.payment_id = _input.payment_id;
    log.total = _input.total;
    log.user_id = _input.user_id;
    await this.logMemberPayAsUseRepository.save(log);

    const amount = parseInt(_input.total + '');

    let now = await this.memberPayAsUseRepository.findOne({
      where: {
        user_id: _input.user_id,
      },
    });

    if (!now) {
      // First record for this account: welcome credits + the purchase (additive).
      // After the one-shot migration every existing user already has a record,
      // so this branch only fires for net-new accounts whose first action is a topup.
      now = new MemberPayAsUse();
      now.user_id = _input.user_id;
      now.total = amount;
      now.balance = WELCOME_CREDITS + amount;
    } else {
      // Existing wallet: top-ups are strictly additive (no bonus, no reset).
      now.total = now.total + amount;
      now.balance = (now.balance ?? 0) + amount;
    }
    now.update_at = updateAt;
    const result = await this.memberPayAsUseRepository.save(now);
    return result;
  }

  async getMemberPayAsUse(userId: string): Promise<any> {
    const now = await this.memberPayAsUseRepository.findOne({
      where: {
        user_id: userId,
      },
    });

    return now;
  }

  /**
   * Atomically spend one credit. Single SQL statement guarded by `balance > 0`
   * so concurrent requests can never double-spend or drive the wallet negative.
   * Returns `{ ok:false }` when there was nothing to spend.
   */
  async consume(userId: string): Promise<{ ok: boolean; balance: number }> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const rows = await this.memberPayAsUseRepository.query(
      `UPDATE member_pay_as_use
         SET balance = balance - 1, update_at = $2
       WHERE user_id = $1 AND balance > 0
       RETURNING balance`,
      [userId, updateAt],
    );
    if (!rows || rows.length === 0) {
      return { ok: false, balance: 0 };
    }
    return { ok: true, balance: Number(rows[0].balance) };
  }

  /**
   * Create the wallet row for an account that has none yet, seeding it with the
   * computed entitlement (welcome grant or legacy backfill). Idempotent: if a row
   * already exists it is returned untouched so welcome can never be granted twice.
   */
  async upsertBalance(
    userId: string,
    balance: number,
  ): Promise<MemberPayAsUse> {
    const existing = await this.memberPayAsUseRepository.findOne({
      where: { user_id: userId },
    });
    if (existing) {
      return existing;
    }
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const rec = new MemberPayAsUse();
    rec.user_id = userId;
    rec.total = 0;
    rec.balance = balance;
    rec.update_at = updateAt;
    return this.memberPayAsUseRepository.save(rec);
  }
}
