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

@Entity('vaccinations')
export class Vaccination {
  @PrimaryGeneratedColumn('uuid', { name: 'vaccination_id' })
  vaccinationId: string;

  @Index()
  @ManyToOne(() => Child)
  @JoinColumn({ name: 'child_id' })
  child: Child;

  @Column({ name: 'vaccine_code', length: 40 })
  vaccineCode: string;

  @Column({ name: 'dose_number', type: 'smallint', nullable: true })
  doseNumber?: number;

  @Column({ name: 'administered_at', type: 'date' })
  administeredAt: string;

  @ManyToOne(() => Facility, { nullable: true })
  @JoinColumn({ name: 'facility_id' })
  facility?: Facility;

  @Column({ name: 'administered_by' })
  administeredBy: string;

  @Column({ name: 'batch_number', length: 40, nullable: true })
  batchNumber?: string;

  @Column({ length: 300, nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
