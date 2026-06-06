import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'ตารางราศีแฝง' })
export class ChineseHoroscope8SquareHiddenZodiac {
  @PrimaryColumn({ comment: 'หลัก ล่าง' })
  below_id: number;

  @Column({ comment: 'ราศีแฝง' })
  hidden_zodiac: string;
}
