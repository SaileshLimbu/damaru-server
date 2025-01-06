import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../entities/activity_log.entity';
import { CreateActivityLogDto } from '../dtos/create.activity_log.dto';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>
  ) {}

  async log(activityLog: CreateActivityLogDto): Promise<DamaruResponse> {
    await this.activityLogRepository.insert({
      action: activityLog.action.toString(),
      metadata: activityLog.metadata
    });
    return { message: 'Activity logged successfully' };
  }

  async update(id: number, log: Partial<ActivityLog>): Promise<DamaruResponse> {
    return { message: 'Activity log updated', data: await this.activityLogRepository.update(id, log) };
  }

  async findAll(): Promise<DamaruResponse> {
    return { data: await this.activityLogRepository.find() };
  }

  async findOne(id: string): Promise<DamaruResponse> {
    return { data: this.activityLogRepository.findOneBy({ id }) } ;
  }

  async remove(id: number): Promise<DamaruResponse> {
    await this.activityLogRepository.delete(id);
    return { message: 'Activity log deleted' };
  }
}
