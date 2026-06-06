import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  user_id: string;

  @Column({ type: 'text' })
  provider: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  picture_url: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  id_token: string;

  @Column()
  create_at: string;

  @Column()
  update_at: string;
}
