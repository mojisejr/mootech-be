import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'OTP' })
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tel: string;

  @Column()
  message: string;

  @Column()
  ref_code: string;

  @Column()
  code: string;

  @Column()
  user_id: string;

  @Column()
  create_at: string;

  @Column()
  expire_at: string;

  @Column({ nullable: true })
  verify_at: string;
}
