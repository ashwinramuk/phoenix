import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';

export type ProgressStatus = 'new' | 'learning' | 'review' | 'mastered';

// Spaced-repetition state for a (user, topic) pair — SM-2 style.
@Entity('progress')
@Index(['userEmail', 'topic'], { unique: true })
export class Progress {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Topic, { onDelete: 'CASCADE', eager: true })
  topic!: Topic;

  @Column({ default: 'me@local' })
  userEmail!: string;

  @Column({ type: 'varchar', default: 'new' })
  status!: ProgressStatus;

  @Column({ type: 'float', default: 2.5 })
  ease!: number;

  @Column({ type: 'int', default: 0 })
  intervalDays!: number;

  @Column({ type: 'int', default: 0 })
  repetitions!: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastReviewedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  nextDueAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
