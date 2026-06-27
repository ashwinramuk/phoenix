import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';

// One attempt at a question.
// - DSA/coding: `answerText` holds the written approach/solution.
// - System design: `diagram` holds the React Flow graph (nodes + edges) as JSON.
@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Question, (q) => q.submissions, { onDelete: 'CASCADE' })
  question!: Question;

  @Column({ default: 'me@local' })
  userEmail!: string;

  @Column({ type: 'text', nullable: true })
  answerText!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  diagram!: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  // self-assessed confidence 0-5; feeds spaced repetition
  @Column({ type: 'int', nullable: true })
  selfGrade!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
