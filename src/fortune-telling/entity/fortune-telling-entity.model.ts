import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'fortune-telling' })
export class FortuneTelling {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'หมายเลข' })
  no: number;

  @Column({ comment: 'ภาพ', type: 'text' })
  image: string;
}
