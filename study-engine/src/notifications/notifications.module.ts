import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [ProgressModule],
  providers: [NotificationsService],
})
export class NotificationsModule {}
