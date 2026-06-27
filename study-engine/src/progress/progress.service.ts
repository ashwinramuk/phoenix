import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Progress, ProgressStatus } from './entities/progress.entity';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress) private readonly repo: Repository<Progress>,
  ) {}

  summary(userEmail = 'me@local') {
    return this.repo.find({ where: { userEmail }, order: { nextDueAt: 'ASC' } });
  }

  due(userEmail = 'me@local') {
    return this.repo.find({
      where: { userEmail, nextDueAt: LessThanOrEqual(new Date()) },
      order: { nextDueAt: 'ASC' },
    });
  }

  /**
   * Record a review of a topic with a 0-5 confidence grade and reschedule it
   * using an SM-2-style algorithm.
   */
  async review(topicId: number, grade: number, userEmail = 'me@local') {
    let p = await this.repo.findOne({
      where: { userEmail, topic: { id: topicId } },
    });
    if (!p) {
      p = this.repo.create({ userEmail, topic: { id: topicId } });
    }

    if (grade < 3) {
      p.repetitions = 0;
      p.intervalDays = 1;
    } else {
      if (p.repetitions === 0) p.intervalDays = 1;
      else if (p.repetitions === 1) p.intervalDays = 6;
      else p.intervalDays = Math.round(p.intervalDays * p.ease);
      p.repetitions += 1;
    }

    p.ease = Math.max(
      1.3,
      p.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
    );
    p.lastReviewedAt = new Date();
    p.nextDueAt = new Date(Date.now() + p.intervalDays * DAY_MS);
    p.status = this.statusFor(p.repetitions, grade);

    return this.repo.save(p);
  }

  private statusFor(repetitions: number, grade: number): ProgressStatus {
    if (repetitions >= 3 && grade >= 4) return 'mastered';
    if (repetitions >= 1) return 'review';
    return 'learning';
  }
}
