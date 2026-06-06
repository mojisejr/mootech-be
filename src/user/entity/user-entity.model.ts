import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'text', nullable: true })
  account_name: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  surname: string;

  @Column({ type: 'text', nullable: true })
  picture_url: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  refer_code: string;

  @Column()
  create_at: string;

  @Column()
  update_at: string;

  @Column()
  login_at: string;

  @Column()
  dob: string;

  @Column()
  time: string;

  @Column({ default: false })
  is_remember_time: boolean;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'text' })
  place_name: string;

  @Column({ type: 'text' })
  result_code: string;

  @Column({ default: 0 })
  used_point: number;

  @Column({ default: 20 })
  total_point: number;

  @Column({ default: false })
  is_refresh: boolean;

  @Column({ type: 'text' })
  share_img_profile_url: string;
}
