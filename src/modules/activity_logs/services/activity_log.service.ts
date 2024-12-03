import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../entities/activity_log.entity';
import { CreateActivityLogDto } from '../dtos/create.activity_log.dto';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>
  ) {}

  async log(activityLog: CreateActivityLogDto) {
    return this.activityLogRepository.insert({
      action: activityLog.action.toString(),
      device: { device_id: activityLog.device_id },
      account: { id: activityLog.account_id },
      user: { id: activityLog.user_id },
      metadata: activityLog.metadata
    });
  }

  update(id: number, log: Partial<ActivityLog>) {
    return this.activityLogRepository.update(id, log);
  }

  findAll(): Promise<ActivityLog[]> {
    return this.activityLogRepository.find();
  }

  findOne(id: number): Promise<ActivityLog | null> {
    return this.activityLogRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.activityLogRepository.delete(id);
  }
}
