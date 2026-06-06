import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'พนักงาน' })
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ type: 'text' })
  password: string;

  @Column()
  create_at: string;
}
