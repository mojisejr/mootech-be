import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ดวงสมพงษ์ความรัก Rating' })
export class CompatibilityLoveRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'คะแนน เริ่มต้น', type: 'float' })
  start_score: number;

  @Column({ comment: 'คะแนน สิ้นสุด', type: 'float' })
  end_score: number;

  @Column({ comment: 'rating 1 - 10' })
  rating: number;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;
}
