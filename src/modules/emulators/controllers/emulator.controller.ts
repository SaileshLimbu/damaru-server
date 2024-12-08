import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
  @ApiConsumes('application/json', 'text/plain')
  findAll() {
    return this.emulatorService.findAll();
  }

  @Get('/generate-code')
  @ApiConsumes('application/json', 'text/plain')
  generateCodes(@Query('deviceId') deviceId: string) {
    return this.emulatorService.generateCode(deviceId);
  }

  @Get(':deviceId/available')
  @ApiConsumes('application/json', 'text/plain')
  checkAvailability(@Param('deviceId') deviceId: string) {
    return this.emulatorService.checkAvailability(deviceId);
  }

  @Get('codes')
  @ApiConsumes('application/json', 'text/plain')
  getCodes() {
    return this.emulatorService.getEmulatorCodes();
  }

  @Post()
  @ApiBody({
    type: EmulatorDto,
    description: 'Emulator Create'
  })
  @ApiConsumes('application/json', 'text/plain')
  create(@Body() createUserDto: EmulatorDto) {
    return this.emulatorService.create(createUserDto);
  }

  @Put(':id')
  @ApiBody({
    type: EmulatorDto,
    description: 'Emulator Update'
  })
  @ApiConsumes('application/json', 'text/plain')
  update(@Param('id') id: string, @Body() updateUserDto: Partial<EmulatorDto>) {
    return this.emulatorService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiConsumes('application/json', 'text/plain')
  delete(@Param('id') id: number) {
    return this.emulatorService.remove(id);
  }

  @ApiBody({
    type: EmulatorLinkDto,
    description: 'Emulator link dto'
  })
  @ApiConsumes('application/json', 'text/plain')
  @Post('link-emulator')
  linkEmulator(@Body() emulatorLinkDto: EmulatorLinkDto) {
    return this.emulatorService.linkEmulator(emulatorLinkDto);
  }
}
