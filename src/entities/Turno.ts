import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

export type TurnoEstado = 'pendiente' | 'atendido' | 'cancelado';

@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  servicio!: string;

  @Column({ type: 'datetime2' })
  fecha!: Date;

  @Column({ type: 'varchar', default: 'pendiente' })
  estado!: TurnoEstado;

  @ManyToOne(() => User, { eager: true })
  cliente!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
