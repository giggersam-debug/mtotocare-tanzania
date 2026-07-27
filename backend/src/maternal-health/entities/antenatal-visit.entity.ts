import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MaternalHealthRecord } from './maternal-health-record.entity';
import { Facility } from '../../children/entities/facility.entity';

// One row per antenatal (ANC) visit — the full visit log, as opposed to the
// single `anc_visits` count field on MaternalHealthRecord. Lets a nurse see
// exactly which clinics a mother has been to, when, and what was noted each
// time, plus when she's due back.
@Entity('antenatal_visits')
export class AntenatalVisit {
  @PrimaryGeneratedColumn('uuid', { name: 'antenatal_visit_id' })
  antenatalVisitId: string;

  @ManyToOne(() => MaternalHealthRecord)
  @JoinColumn({ name: 'maternal_health_record_id' })
  maternalHealthRecord: MaternalHealthRecord;

  @Column({ name: 'visit_date', type: 'date' })
  visitDate: string;

  // When she's expected back — drives the "next visit due" indicator shown
  // when her record is loaded.
  @Column({ name: 'next_visit_date', type: 'date', nullable: true })
  nextVisitDate?: string;

  @ManyToOne(() => Facility, { nullable: true })
  @JoinColumn({ name: 'facility_id' })
  facility?: Facility;

  @Column({ name: 'recorded_by', nullable: true })
  recordedBy?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
