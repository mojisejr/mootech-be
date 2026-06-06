import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Log ตาราง สมาชิกเจ้าของ กับ Code ' })
export class MemberPaymentCodeLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  member_payment_code_id: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'text' })
  code: string;

  @Column()
  create_at: string;
}
