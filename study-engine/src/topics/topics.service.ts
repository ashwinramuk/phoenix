import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic, TopicCategory } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic) private readonly repo: Repository<Topic>,
  ) {}

  findAll(category?: TopicCategory) {
    return this.repo.find({
      where: category ? { category } : {},
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const topic = await this.repo.findOne({ where: { id } });
    if (!topic) throw new NotFoundException(`Topic ${id} not found`);
    return topic;
  }

  create(dto: CreateTopicDto) {
    return this.repo.save(this.repo.create(dto));
  }
}
