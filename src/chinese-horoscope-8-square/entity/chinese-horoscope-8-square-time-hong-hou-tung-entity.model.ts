import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'คำนวณหลักยาม โหงวโฮ่วตุ๋ง' })
export class ChineseHoroscope8SquareTimeHongHouTung {
  @PrimaryColumn({ comment: 'ลำดับวัน' })
  time_chinese_id: number;

  @PrimaryColumn({ comment: 'หลัก วันบน จากการคำนวณ' })
  day_above_id: number;

  @Column({ comment: 'เวลาเริ่ม' })
  start_time: string;

  @Column({ comment: 'เวลาสิ้นสุด' })
  end_time: string;

  @Column({ comment: 'หลัก ยามบน' })
  time_above_id: number;

  @Column({ comment: 'หลัก ยามล่าง' })
  time_below_id: number;
}
