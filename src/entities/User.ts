import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type UserRole = 'admin' | 'empleado' | 'cliente';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  nombre!: string;

  @Column({ type: 'varchar', default: 'cliente' })
  rol!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;
}
