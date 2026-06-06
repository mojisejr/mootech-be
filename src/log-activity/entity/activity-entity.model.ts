import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Activity' })
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;
}
