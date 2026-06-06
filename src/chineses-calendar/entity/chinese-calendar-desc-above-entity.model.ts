import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ปฏิทินจีน ความหมาย Code A' })
export class ChineseCalendarDescAbove {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ type: 'text' })
  description: string;
}
