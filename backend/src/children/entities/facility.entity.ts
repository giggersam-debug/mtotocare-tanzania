import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('facilities')
export class Facility {
  @PrimaryGeneratedColumn('uuid', { name: 'facility_id' })
  facilityId: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 30 })
  level: 'dispensary' | 'health_centre' | 'hospital';

  @Column({ length: 80 })
  region: string;

  @Column({ name: 'moh_code', length: 30, unique: true })
  mohCode: string;
}
