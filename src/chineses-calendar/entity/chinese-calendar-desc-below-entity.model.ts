import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ปฏิทินจีน ความหมาย Code B' })
export class ChineseCalendarDescBelow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ type: 'text' })
  description: string;
}
