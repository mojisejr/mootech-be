import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'หลักล่าง' })
export class ChineseHoroscope8SquareBelow {
  @PrimaryColumn({ comment: 'ตัวเลข' })
  id: number;

  @Column({ comment: 'นักษัตร' })
  constellation: string;

  @Column({ comment: 'อักษรจีน' })
  chinese_symbol: string;

  @Column({ comment: 'คำอ่าน' })
  pronunciation: string;

  @Column({ comment: 'พลัง' })
  power: string;

  @Column({ comment: 'ธาตุ' })
  element: string;

  @Column({ comment: 'ทิศ' })
  direction: string;

  @Column({ comment: 'สี' })
  color: string;
}
