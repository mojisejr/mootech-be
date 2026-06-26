import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'ตาราง Topup' })
export class MemberPayAsUse {
  @PrimaryColumn('uuid')
  user_id: string;

  @Column()
  update_at: string;

  @Column()
  total: number;

  // Wallet balance — decrement-only credit remaining (the true spendable wallet).
  // `total` is kept as cumulative-purchased audit. synchronize=false in this app,
  // so the physical column is created by the wallet migration DDL (see
  // src/member-pay-as-use/migrations/2026-06-26-wallet-balance.sql).
  @Column({ type: 'int', default: 0 })
  balance: number;
}
