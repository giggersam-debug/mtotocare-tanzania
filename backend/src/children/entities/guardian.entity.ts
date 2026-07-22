import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Child } from './child.entity';

@Entity('guardians')
export class Guardian {
  @PrimaryGeneratedColumn('uuid', { name: 'guardian_id' })
  guardianId: string;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ length: 30 })
  relation: 'mother' | 'father' | 'guardian';

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ name: 'whatsapp_opt_in', default: false })
  whatsappOptIn: boolean;

  @Column({ name: 'national_id_ref', length: 30, nullable: true })
  nationalIdRef?: string;

  @OneToMany(() => Child, (child) => child.guardian)
  children: Child[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
