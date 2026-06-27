import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ReviewDto } from './dto/review.dto';

@Controller()
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  // GET /progress — spaced-repetition state for all topics
  @Get('progress')
  summary(@Query('user') user?: string) {
    return this.progress.summary(user);
  }

  // GET /progress/due — what to review today
  @Get('progress/due')
  due(@Query('user') user?: string) {
    return this.progress.due(user);
  }

  // POST /topics/:id/review { grade } — record a review, reschedule
  @Post('topics/:id/review')
  review(@Param('id', ParseIntPipe) id: number, @Body() dto: ReviewDto) {
    return this.progress.review(id, dto.grade, dto.user);
  }
}
