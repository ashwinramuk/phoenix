import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question) private readonly repo: Repository<Question>,
  ) {}

  findByTopic(topicId: number) {
    return this.repo.find({
      where: { topic: { id: topicId } },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const q = await this.repo.findOne({
      where: { id },
      relations: { topic: true },
    });
    if (!q) throw new NotFoundException(`Question ${id} not found`);
    return q;
  }

  create(dto: CreateQuestionDto) {
    const { topicId, ...rest } = dto;
    return this.repo.save(this.repo.create({ ...rest, topic: { id: topicId } }));
  }
}
