import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Heavenly Spirit Card' })
export class HeavenlySpiritCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'หมายเลข' })
  no: number;

  @Column({ comment: 'สิ่งศักดิ์สิทธิ์', type: 'text' })
  sacred_things: string;

  @Column({ comment: 'Keyword ไทย', type: 'text' })
  keyword_th: string;

  @Column({ comment: 'Keyword อังกฤษ', type: 'text' })
  keyword_en: string;

  @Column({ comment: 'ภาพนิมิต', type: 'text' })
  vision: string;

  @Column({ comment: 'สาส์นจากแดนสวรรค์', type: 'text' })
  message_from_heaven: string;

  @Column({ comment: 'ภาพ', type: 'text' })
  image: string;
}
