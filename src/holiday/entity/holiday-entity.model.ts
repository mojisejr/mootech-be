import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'วันหยุดไทย' })
export class Holiday {
  @PrimaryColumn()
  day: number;

  @PrimaryColumn()
  month: number;

  @PrimaryColumn()
  year: number;

  @Column()
  date: string;

  @Column()
  description: string;
}
