import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  user_id: string;

  @Column({ type: 'text' })
  payment_plan: string;

  @Column({ type: 'text' })
  payment_package: string;

  @Column({ type: 'text' })
  payment_package_name: string;

  @Column({ type: 'float' })
  payment_amount: number;

  @Column({ type: 'text' })
  file: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ default: 'WAIT' })
  status: string; // WAIT , APPROVED, REJECT

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column()
  submit_at: string;

  @Column({ nullable: true })
  approve_at: string;

  @Column({ nullable: true })
  approve_by: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  order_id: string;

  @Column({ default: 'TRANSFER' })
  payment_by: string; // TRANSFER, CREDIT_CARD, PROMPTPAY

  @Column({ type: 'text' })
  charge_id: string;
}
