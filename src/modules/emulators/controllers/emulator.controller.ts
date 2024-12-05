import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { EmulatorDto } from '../dtos/emulator.dto';
import { EmulatorService } from '../services/emulator.service';
import { EmulatorLinkDto } from '../dtos/emulator-link.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { SuperAdmin } from '../../../core/guards/super_admin.guard';

@ApiTags('Emulators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdmin)
@Controller('emulators')
export class EmulatorController {
  constructor(private readonly emulatorService: EmulatorService) {}

  /**
   * Retrieves all users.
   *
   * @returns An array of all user objects
   */
  @Get()
  findAll() {
    return this.emulatorService.findAll();
  }

  @Get('/generate-code')
  generateCodes(@Query('deviceId') deviceId: string) {
    return this.emulatorService.generateCode(deviceId);
  }

  @Get(':deviceId/available')
  checkAvailability(@Param('deviceId') deviceId: string) {
    return this.emulatorService.checkAvailability(deviceId);
  }

  @Get('codes')
  getCodes() {
    return this.emulatorService.getEmulatorCodes();
  }

  @Post()
  @ApiBody({
    type: EmulatorDto,
    description: 'Emulator Create'
  })
  create(@Body() createUserDto: EmulatorDto) {
    return this.emulatorService.create(createUserDto);
  }

  @Put(':id')
  @ApiBody({
    type: EmulatorDto,
    description: 'Emulator Update'
  })
  update(@Param('id') id: string, @Body() updateUserDto: Partial<EmulatorDto>) {
    return this.emulatorService.update(id, updateUserDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.emulatorService.remove(id);
  }

  @ApiBody({
    type: EmulatorLinkDto,
    description: 'Emulator link dto'
  })
  @Post('link-emulator')
  linkEmulator(@Body() emulatorLinkDto: EmulatorLinkDto) {
    return this.emulatorService.linkEmulator(emulatorLinkDto);
  }
}
