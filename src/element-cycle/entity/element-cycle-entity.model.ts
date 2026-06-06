import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'วงจรธาตุ' })
export class ElementCycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  element: string;

  @Column({ comment: 'พลัง' })
  power: string;

  @Column({ comment: 'เพศ' })
  gender: string;

  @Column({ comment: 'เพื่อน พี่น้อง หุ้นส่วน' })
  element_friend: string;

  @Column({ comment: 'เรียน ทำงาน ลงทุน' })
  element_work: string;

  @Column({ comment: 'หน้าที่การงาน' })
  element_career: string;

  @Column({ comment: 'โชคลาภ' })
  element_fortune: string;

  @Column({ comment: 'คู่ครอง' })
  element_spouse: string;

  @Column({ comment: 'ผู้สนับสนุน ส่งเสริม' })
  element_supporter: string;
}
