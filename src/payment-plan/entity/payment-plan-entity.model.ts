import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง Plan' })
export class PaymentPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  plan_code: string;

  @Column({ type: 'text' })
  description: string;
}
