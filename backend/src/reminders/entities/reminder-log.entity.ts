import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Child } from '../../children/entities/child.entity';

export type ReminderChannel = 'sms' | 'whatsapp';
export type ReminderStatus = 'sent' | 'failed';

@Entity('reminder_log')
export class ReminderLog {
  @PrimaryGeneratedColumn('uuid', { name: 'reminder_id' })
  reminderId: string;

  @ManyToOne(() => Child)
  @JoinColumn({ name: 'child_id' })
  child: Child;

  @Column({ name: 'vaccine_code', length: 40 })
  vaccineCode: string;

  @Column({ length: 10 })
  channel: ReminderChannel;

  @Column({ length: 20 })
  status: ReminderStatus;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;
}
