import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MaternalHealthRecord } from './maternal-health-record.entity';
import { Facility } from '../../children/entities/facility.entity';

export type UrineTestResult = 'negative' | 'trace' | 'positive';

// One row per antenatal (ANC) visit — the full visit log, as opposed to the
// single `anc_visits` count field on MaternalHealthRecord. Captures the same
// structured vitals/checks a nurse records on the physical RCH antenatal
// card at every visit, not just a free-text note.
@Entity('antenatal_visits')
export class AntenatalVisit {
  @PrimaryGeneratedColumn('uuid', { name: 'antenatal_visit_id' })
  antenatalVisitId: string;

  @ManyToOne(() => MaternalHealthRecord)
  @JoinColumn({ name: 'maternal_health_record_id' })
  maternalHealthRecord: MaternalHealthRecord;

  @Column({ name: 'visit_date', type: 'date' })
  visitDate: string;

  @Column({ name: 'gestational_age_weeks', type: 'integer', nullable: true })
  gestationalAgeWeeks?: number;

  @Column({ name: 'weight_kg', type: 'numeric', precision: 5, scale: 1, nullable: true })
  weightKg?: number;

  @Column({ name: 'bp_systolic', type: 'integer', nullable: true })
  bpSystolic?: number;

  @Column({ name: 'bp_diastolic', type: 'integer', nullable: true })
  bpDiastolic?: number;

  @Column({ name: 'fundal_height_cm', type: 'numeric', precision: 4, scale: 1, nullable: true })
  fundalHeightCm?: number;

  @Column({ name: 'fetal_heartbeat_present', type: 'boolean', nullable: true })
  fetalHeartbeatPresent?: boolean;

  @Column({ name: 'danger_signs', type: 'text', nullable: true })
  dangerSigns?: string;

  @Column({ name: 'urine_protein', length: 20, nullable: true })
  urineProtein?: UrineTestResult;

  @Column({ name: 'urine_glucose', length: 20, nullable: true })
  urineGlucose?: UrineTestResult;

  @Column({ name: 'hemoglobin_gdl', type: 'numeric', precision: 4, scale: 1, nullable: true })
  hemoglobinGdl?: number;

  @Column({ name: 'iron_folic_acid_given', type: 'boolean', default: false })
  ironFolicAcidGiven: boolean;

  // Which IPTp-SP malaria-prevention dose (1st, 2nd, 3rd+) was given this visit, if any.
  @Column({ name: 'iptp_sp_dose_given', type: 'integer', nullable: true })
  iptpSpDoseGiven?: number;

  @Column({ name: 'deworming_given', type: 'boolean', default: false })
  dewormingGiven: boolean;

  @Column({ name: 'investigations_ordered', type: 'text', nullable: true })
  investigationsOrdered?: string;

  // When she's expected back — drives the "next visit due" indicator shown
  // when her record is loaded.
  @Column({ name: 'next_visit_date', type: 'date', nullable: true })
  nextVisitDate?: string;

  @ManyToOne(() => Facility, { nullable: true })
  @JoinColumn({ name: 'facility_id' })
  facility?: Facility;

  @Column({ name: 'recorded_by', nullable: true })
  recordedBy?: string;

  // Catch-all for anything not covered by the structured fields above.
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
