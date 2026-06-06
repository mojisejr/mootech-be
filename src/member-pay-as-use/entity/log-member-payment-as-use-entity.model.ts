import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง Log Topup Success' })
export class LogMemberPayAsUse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'text' })
  payment_id: string;

  @Column({ comment: 'วันที่ซื้อ' })
  create_at: string;

  @Column()
  total: number;
}
