import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'ตาราง Topup' })
export class MemberPayAsUse {
  @PrimaryColumn('uuid')
  user_id: string;

  @Column()
  update_at: string;

  @Column()
  total: number;
}
