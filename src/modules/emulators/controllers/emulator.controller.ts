import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { EmulatorUserDto } from '../dtos/emulator.user.dto';
import { EmulatorService } from '../services/emulator.service';

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
    type: EmulatorUserDto,
    description: 'Emulator Create',
  })
  create(@Body() createUserDto: EmulatorUserDto) {
    return this.emulatorService.create(createUserDto);
  }

  @Put(':id')
  @ApiBody({
    type: EmulatorUserDto,
    description: 'Emulator Update',
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<EmulatorUserDto>,
  ) {
    return this.emulatorService.update(id, updateUserDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.emulatorService.remove(id);
  }
}
