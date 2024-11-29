import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ description: '{"message" : "OK"}', status: 200 })
  @Get()
  checkHealth(): string {
    return this.appService.checkHealth();
  }
}
