import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';
import { Submission } from '../../submissions/entities/submission.entity';

export type QuestionType = 'coding' | 'system-design' | 'mcq';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Topic, (t) => t.questions, { onDelete: 'CASCADE' })
  topic!: Topic;

  @Column({ type: 'varchar' })
  type!: QuestionType;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  prompt!: string;

  @Column({ type: 'varchar', nullable: true })
  difficulty!: string | null;

  // optional hints / reference approach for self-review
  @Column({ type: 'jsonb', nullable: true })
  hints!: string[] | null;

  @Column({ type: 'text', nullable: true })
  referenceSolution!: string | null;

  @OneToMany(() => Submission, (s) => s.question)
  submissions!: Submission[];

  @CreateDateColumn()
  createdAt!: Date;
}
