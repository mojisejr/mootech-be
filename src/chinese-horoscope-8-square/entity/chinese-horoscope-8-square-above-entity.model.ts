import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'หลักบน' })
export class ChineseHoroscope8SquareAbove {
  @PrimaryColumn({ comment: 'ตัวเลข' })
  id: number;

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
