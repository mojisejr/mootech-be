import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง สมาชิกเจ้าของ กับ Code ' })
export class MemberPaymentCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'text' })
  code: string;

  @Column()
  create_at: string;

  @Column()
  owner_by: string;
}
