import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ActivityLogService } from '../services/activity_log.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateActivityLogDto } from '../dtos/create.activity_log.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { AndroidAdmin } from '../../../core/guards/android_admin.guard';
import { SuperAdmin } from '../../../core/guards/super_admin.guard';

@ApiTags('ActivityLogs')
@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  /**
   * Retrieves all users.
   *
   * @returns An array of all user objects
   */
  @Get()
  @ApiBearerAuth()
  @ApiConsumes('application/json', 'text/plain')
  @UseGuards(JwtAuthGuard, AndroidAdmin)
  findAll() {
    return this.activityLogService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdmin)
  @ApiBody({
    type: CreateActivityLogDto,
    description: 'ActivityLog Create'
  })
  @ApiConsumes('application/json', 'text/plain')
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogService.log(createActivityLogDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdmin)
  @ApiBody({
    type: CreateActivityLogDto,
    description: 'Update Create'
  })
  @ApiConsumes('application/json', 'text/plain')
  update(@Param('id') id: number, @Body() updateAccountDto: Partial<CreateActivityLogDto>) {
    return this.activityLogService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdmin)
  @ApiConsumes('application/json', 'text/plain')
  delete(@Param('id') id: number) {
    return this.activityLogService.remove(id);
  }
}
