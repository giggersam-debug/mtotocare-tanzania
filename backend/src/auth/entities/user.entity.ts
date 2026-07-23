import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Facility } from '../../children/entities/facility.entity';

export type UserRole = 'nurse' | 'doctor' | 'nutritionist' | 'pharmacist' | 'ministry' | 'administrator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ length: 60, unique: true })
  username: string;

  @Column({ name: 'password_hash', length: 100 })
  passwordHash: string;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ length: 30 })
  role: UserRole;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @ManyToOne(() => Facility, { nullable: true })
  @JoinColumn({ name: 'facility_id' })
  facility?: Facility;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
