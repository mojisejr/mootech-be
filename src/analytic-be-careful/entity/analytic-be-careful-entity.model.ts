import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'พึงระวัง' })
export class AnalyticBeCareful {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันบน' })
  day_above_element: string;

  @Column({ comment: 'พลัง' })
  power: string;

  @Column({ type: 'text', comment: 'พึงระวัง' })
  note: string;
}
