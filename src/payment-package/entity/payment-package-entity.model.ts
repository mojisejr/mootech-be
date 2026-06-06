import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง Package' })
export class PaymentPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  plan_code: string;

  @Column({ type: 'text' })
  package_code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 0, comment: 'เพิ่มวันก่อนนับจริง' })
  buffer_day: number;

  @Column({ default: 0, type: 'float' })
  amount: number;

  @Column({ comment: 'หมดอายุ xY xM xD' })
  expire: string;

  @Column({ default: 1 })
  max_user: number;
}
