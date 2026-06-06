import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Log ตาราง สมาชิกสมัคร package' })
export class MemberPaymentLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
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

  @Column({ type: 'text' })
  payment_id: string;

  @Column({ type: 'text' })
  code: string;
}
