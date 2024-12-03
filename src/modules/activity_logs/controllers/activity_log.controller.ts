import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ActivityLogService } from '../services/activity_log.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateActivityLogDto } from '../dtos/create.activity_log.dto';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  /**
   * Retrieves all users.
   *
   * @returns An array of all user objects
   */
  @Get()
  findAll() {
    return this.activityLogService.findAll();
  }

  @Post()
  @ApiBody({
    type: CreateActivityLogDto,
    description: 'ActivityLog Create'
  })
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogService.log(createActivityLogDto);
  }

  @Put(':id')
  @ApiBody({
    type: CreateActivityLogDto,
    description: 'Update Create'
  })
  update(@Param('id') id: string, @Body() updateAccountDto: Partial<CreateActivityLogDto>) {
    return this.activityLogService.update(id, updateAccountDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.activityLogService.remove(id);
  }
}
