import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';

export type TopicCategory = 'dsa' | 'system-design';

// A learnable unit: a DSA pattern (e.g. "Two Pointer") or a system-design topic.
@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  category!: TopicCategory;

  @Column()
  name!: string;

  @Index({ unique: true })
  @Column()
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: true })
  difficulty!: string | null;

  @Column({ default: 0 })
  sortOrder!: number;

  @OneToMany(() => Question, (q) => q.topic)
  questions!: Question[];

  @CreateDateColumn()
  createdAt!: Date;
}
