import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly progress: ProgressService) {}

  // Daily digest: surface the topics whose spaced-repetition review is due.
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyDigest() {
    const due = await this.progress.due();
    if (due.length === 0) {
      this.logger.log('No reviews due today 🎉');
      return;
    }
    const names = due
      .map((p) => p.topic?.name ?? `topic#${p.topic?.id}`)
      .join(', ');
    this.logger.log(`🔔 ${due.length} review(s) due today: ${names}`);
  }
}
