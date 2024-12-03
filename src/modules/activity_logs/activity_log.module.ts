import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ActivityLogService } from './services/activity_log.service';
import { ActivityLogController } from './controllers/activity_log.controller';
import { ActivityLog } from './entities/activity_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  providers: [ActivityLogService],
  controllers: [ActivityLogController],
  exports: [ActivityLogService]
})
export class ActivityLogModule {}
