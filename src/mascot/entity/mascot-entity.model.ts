import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Mascot' })
export class Mascot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันบน' })
  day_above_element: string;

  @Column({ comment: 'พลัง' })
  power: string;

  @Column({ nullable: true })
  gender: string;

  @Column()
  url: string;

  @Column()
  description: string;
}
