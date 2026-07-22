import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guardian } from './guardian.entity';
import { Facility } from './facility.entity';

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn('uuid', { name: 'child_id' })
  childId: string;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: string;

  @Column({ length: 10 })
  sex: 'male' | 'female';

  @Column({ name: 'birth_weight_kg', type: 'numeric', precision: 4, scale: 2, nullable: true })
  birthWeightKg?: number;

  @Column({ name: 'birth_height_cm', type: 'numeric', precision: 4, scale: 1, nullable: true })
  birthHeightCm?: number;

  @ManyToOne(() => Facility, { nullable: true })
  @JoinColumn({ name: 'birth_facility_id' })
  birthFacility?: Facility;

  @ManyToOne(() => Guardian, (guardian) => guardian.children)
  @JoinColumn({ name: 'guardian_id' })
  guardian: Guardian;

  @Column({ length: 80, nullable: true })
  region?: string;

  @Column({ length: 80, nullable: true })
  district?: string;

  @Column({ length: 80, nullable: true })
  ward?: string;

  @Column({ length: 80, nullable: true })
  village?: string;

  @Index({ unique: true })
  @Column({ name: 'qr_token', length: 64, unique: true })
  qrToken: string;

  @Column({ name: 'national_health_number', length: 30, nullable: true, unique: true })
  nationalHealthNumber?: string;

  @Column({ name: 'birth_registration_number', length: 30, nullable: true })
  birthRegistrationNumber?: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
