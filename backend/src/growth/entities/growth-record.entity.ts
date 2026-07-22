import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Child } from '../../children/entities/child.entity';
import { Facility } from '../../children/entities/facility.entity';

export type NutritionalStatus = 'normal' | 'moderate_acute_malnutrition' | 'severe_acute_malnutrition';

@Entity('growth_records')
export class GrowthRecord {
  @PrimaryGeneratedColumn('uuid', { name: 'growth_record_id' })
  growthRecordId: string;

  @Index()
  @ManyToOne(() => Child)
  @JoinColumn({ name: 'child_id' })
  child: Child;

  @Column({ name: 'visit_date', type: 'date' })
  visitDate: string;

  @Column({ name: 'weight_kg', type: 'numeric', precision: 5, scale: 2, nullable: true })
  weightKg?: number;

  @Column({ name: 'height_cm', type: 'numeric', precision: 5, scale: 1, nullable: true })
  heightCm?: number;

  @Column({ name: 'muac_cm', type: 'numeric', precision: 4, scale: 1, nullable: true })
  muacCm?: number;

  @Column({ name: 'nutritional_status', length: 30, nullable: true })
  nutritionalStatus?: NutritionalStatus;

  @ManyToOne(() => Facility, { nullable: true })
  @JoinColumn({ name: 'facility_id' })
  facility?: Facility;

  @Column({ name: 'recorded_by' })
  recordedBy: string;

  @Column({ length: 300, nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
