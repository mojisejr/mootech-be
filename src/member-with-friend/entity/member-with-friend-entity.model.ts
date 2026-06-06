import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MemberWithFriend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', comment: 'ผู้ที่ Add Friend' })
  user_id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  surname: string;

  @Column({ type: 'text', nullable: true })
  picture_url: string;

  @Column()
  create_at: string;

  @Column()
  update_at: string;

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

  @Column({ default: false, comment: 'เป็นสมาชิกแล้ว' })
  is_member: boolean;

  @Column({ type: 'text', comment: 'รหัสสมาชิก' })
  member_id: string;

  @Column({ default: false })
  is_notify: boolean;
}
