import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Child } from '../../children/entities/child.entity';
import { Guardian } from '../../children/entities/guardian.entity';
import { Facility } from '../../children/entities/facility.entity';

export type HivStatus = 'positive' | 'negative' | 'unknown';
export type ArtAdherence = 'good' | 'fair' | 'poor' | 'n/a';
export type DeliveryMode = 'vaginal' | 'cesarean' | 'assisted';

@Entity('maternal_health_records')
export class MaternalHealthRecord {
  @PrimaryGeneratedColumn('uuid', { name: 'maternal_health_record_id' })
  maternalHealthRecordId: string;

  // Nullable — a pregnancy record can be created before the child exists
  // (registered during an antenatal visit) and attached to the child later.
  @ManyToOne(() => Child, { nullable: true })
  @JoinColumn({ name: 'child_id' })
  child?: Child;

  @ManyToOne(() => Guardian)
  @JoinColumn({ name: 'guardian_id' })
  guardian: Guardian;

  @Column({ type: 'integer', nullable: true })
  gravida?: number;

  @Column({ type: 'integer', nullable: true })
  para?: number;

  @Column({ name: 'estimated_due_date', type: 'date', nullable: true })
  estimatedDueDate?: string;

  @Column({ name: 'anc_visits', type: 'integer', nullable: true })
  ancVisits?: number;

  @Column({ name: 'gestational_age_weeks', type: 'integer', nullable: true })
  gestationalAgeWeeks?: number;

  @Column({ name: 'gestational_diabetes', default: false })
  gestationalDiabetes: boolean;

  @Column({ default: false })
  hypertension: boolean;

  @Column({ default: false })
  anemia: boolean;

  @Column({ name: 'malaria_in_pregnancy', default: false })
  malariaInPregnancy: boolean;

  @Column({ name: 'hiv_status', length: 20, default: 'unknown' })
  hivStatus: HivStatus;

  @Column({ name: 'art_adherence', length: 20, nullable: true })
  artAdherence?: ArtAdherence;

  @Column({ name: 'delivery_mode', length: 20, nullable: true })
  deliveryMode?: DeliveryMode;

  @Column({ name: 'apgar_score', type: 'integer', nullable: true })
  apgarScore?: number;

  @Column({ name: 'delivery_complications', type: 'text', nullable: true })
  deliveryComplications?: string;

  @Column({ name: 'genetic_family_history', type: 'text', nullable: true })
  geneticFamilyHistory?: string;

  @Column({ name: 'consent_given', default: false })
  consentGiven: boolean;

  @Column({ name: 'recorded_by', nullable: true })
  recordedBy?: string;

  @ManyToOne(() => Facility, { nullable: true })
  @JoinColumn({ name: 'facility_id' })
  facility?: Facility;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
