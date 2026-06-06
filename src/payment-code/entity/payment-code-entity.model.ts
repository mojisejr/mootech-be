import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง Promotion Code' })
export class PaymentCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text' })
  plan_code: string;

  @Column({ type: 'text' })
  package_code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ comment: 'หมดอายุ xY xM xD' })
  expire: string;

  @Column({ default: 1, comment: 'จำนวนสูงสุดที่ใช้ได้' })
  max_use: number;

  @Column()
  create_at: string;

  @Column({ default: true })
  is_active: boolean;
}
