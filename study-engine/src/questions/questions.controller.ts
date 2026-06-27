import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmissionsService } from '../submissions/submissions.service';
import { CreateSubmissionDto } from '../submissions/dto/create-submission.dto';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questions: QuestionsService,
    private readonly submissions: SubmissionsService,
  ) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questions.findOne(id);
  }

  @Get(':id/submissions')
  listSubmissions(@Param('id', ParseIntPipe) id: number) {
    return this.submissions.findByQuestion(id);
  }

  // POST /questions/:id/submissions — submit a DSA answer or a system-design diagram
  @Post(':id/submissions')
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.submissions.create(id, dto);
  }

  @Post()
  create(@Body() dto: CreateQuestionDto) {
    return this.questions.create(dto);
  }
}
