import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'ตาราง สมาชิกสมัคร package' })
export class MemberPayment {
  @PrimaryColumn('uuid')
  user_id: string;

  @Column({ type: 'text' })
  plan_code: string;

  @Column({ type: 'text' })
  package_code: string;

  @Column({ comment: 'วันที่ซื้อ' })
  create_at: string;

  @Column({ comment: 'วันที่ซื้อ' })
  start_at: string;

  @Column({ comment: 'วันที่หมดอายุ' })
  expire_at: string;
}
