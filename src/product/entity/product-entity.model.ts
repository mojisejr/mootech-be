import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'สินค้าแนะนำ' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  image: string;

  @Column({ type: 'text' })
  url: string;

  @Column()
  is_show: boolean;

  @Column({ type: 'text' })
  element: string;

  @Column({ type: 'text', comment: '' })
  product_type: string;
}
/*
1 เสื้อเสริมดวงธาตุ.. | ELEMENT
2 เสริมดวงความรัก | LOVE
  แก้เคล็ด ปรับดวงรัก |  UPSKILL_LOVE
3 ของมงคลโต๊ะทำงาน | WORK
  ไอเทมสายพัฒนา | UPSKILL_WORK
4 ของขลังและสิ่งศักดิ์สิทธิ์ | HOLY
5 คุ้มครอง ปกป้อง นำโชค | PROTECTION



1. General Profile ตามสีแต่ละธาตุ	1,2,3,4,5
2. หน้า love"	2,5
3. หน้งงาน"	3,4,5
*/
