import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import type { TopicCategory } from './entities/topic.entity';
import { QuestionsService } from '../questions/questions.service';

@Controller('topics')
export class TopicsController {
  constructor(
    private readonly topics: TopicsService,
    private readonly questions: QuestionsService,
  ) {}

  // GET /topics?category=dsa  — list patterns / system-design topics
  @Get()
  findAll(@Query('category') category?: TopicCategory) {
    return this.topics.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.topics.findOne(id);
  }

  // GET /topics/:id/questions — questions under a pattern/topic
  @Get(':id/questions')
  questionsForTopic(@Param('id', ParseIntPipe) id: number) {
    return this.questions.findByTopic(id);
  }

  @Post()
  create(@Body() dto: CreateTopicDto) {
    return this.topics.create(dto);
  }
}
