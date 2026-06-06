import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง Log สมพงษ์' })
export class UserMatching {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'text' })
  friend_id: string;

  @Column()
  matching_type: string; // LOVE , WORK

  @Column()
  create_at: string;
}
