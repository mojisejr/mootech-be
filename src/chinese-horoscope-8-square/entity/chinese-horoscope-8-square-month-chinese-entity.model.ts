import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'หลักการตัดเดือนของจีน' })
export class ChineseHoroscope8SquareMonthChinese {
  @PrimaryColumn({ comment: 'ลำดับเดือน' })
  month_chinese_id: number;

  @Column({ comment: 'วันเริ่มของเดือน' })
  start_day: number;

  @Column({ comment: 'ปีเริ่มของเดือน' })
  start_month: number;

  @Column({ comment: 'วันสิ้นสุดของเดือน' })
  end_day: number;

  @Column({ comment: 'ปีสิ้นสุดของเดือน' })
  end_month: number;

  @Column({ comment: 'วันที่ เริ่ม' })
  start_date: string;

  @Column({ comment: 'วันที่ สิ้นสุด' })
  end_date: string;

  @Column({ comment: 'เทียบตาราง หลักล่าง' })
  chinese_horoscope_8_square_below_id: number;
}
