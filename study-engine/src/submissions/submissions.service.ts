import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { Question } from '../questions/entities/question.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission) private readonly repo: Repository<Submission>,
    @InjectRepository(Question) private readonly questions: Repository<Question>,
    private readonly progress: ProgressService,
  ) {}

  findByQuestion(questionId: number) {
    return this.repo.find({
      where: { question: { id: questionId } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(questionId: number, dto: CreateSubmissionDto) {
    const submission = await this.repo.save(
      this.repo.create({ ...dto, question: { id: questionId } }),
    );

    // Submitting with a self-grade advances spaced repetition on the question's topic.
    if (dto.selfGrade != null) {
      const q = await this.questions.findOne({
        where: { id: questionId },
        relations: { topic: true },
      });
      if (q?.topic) {
        await this.progress.review(q.topic.id, dto.selfGrade, dto.userEmail);
      }
    }
    return submission;
  }
}
