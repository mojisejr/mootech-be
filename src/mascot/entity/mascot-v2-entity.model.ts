import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Mascot V2' })
export class MascotV2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันล่าง' })
  day_below_id: number;

  @Column({ comment: 'พลัง = 1 : YANG , 2 : YIN' })
  power: string;

  @Column({ comment: 'พลัง' })
  element: string;

  @Column()
  url: string;

  @Column()
  description: string;

  @Column({ comment: 'ชื่อ' })
  mascot_name: string;

  @Column({ comment: 'นิสัย', type: 'text' })
  behaviour: string;

  @Column({ comment: 'Person', type: 'text' })
  person: string;

  @Column({ comment: 'Work', type: 'text' })
  work: string;

  @Column({ comment: 'Weath', type: 'text' })
  wealth: string;

  @Column({ comment: 'health', type: 'text' })
  health: string;

  @Column({ comment: 'Love', type: 'text' })
  love: string;

  @Column({ comment: 'Family', type: 'text' })
  family: string;

  @Column({ comment: 'sacred item', type: 'text' })
  sacred_item: string;

  @Column({ comment: 'Url Share', type: 'text' })
  url_share: string;
}
