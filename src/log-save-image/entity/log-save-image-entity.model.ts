import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ comment: 'Log Save Image' })
export class LogSaveImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  user_id: string;

  @Column()
  createAt: string;

  @Column({ default: 'PROFILE' })
  page: string;
}
