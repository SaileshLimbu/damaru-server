import { Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmulatorDto } from '../dtos/emulator.dto';
import { EmulatorService } from '../services/emulator.service';
import { EmulatorLinkDto } from '../dtos/emulator-link.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { AuthUser } from '../../../common/interfaces/AuthUser';
import { EmulatorUsers } from '../../../core/guards/emulator_user.guard';
import { EmulatorAdmin } from '../../../core/guards/emulator_admin.guard';
import { SuperAdmin } from '../../../core/guards/super_admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Emulators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emulators')
export class EmulatorController {
  constructor(private readonly emulatorService: EmulatorService) {}

  @Get()
  @UseGuards(EmulatorUsers)
  @ApiOperation({ description: 'Android users or Emulator Admin can view emulators' })
  @ApiConsumes('application/json', 'text/plain')
  findAll(@Req() authUser: AuthUser) {
    return this.emulatorService.findAll(authUser.user);
  }

  @Get(':deviceId/available')
  @UseGuards(EmulatorUsers)
  @ApiConsumes('application/json', 'text/plain')
  checkAvailability(@Param('deviceId') deviceId: string) {
    return this.emulatorService.checkAvailability(deviceId);
  }

  @Post()
  @ApiBody({
    type: EmulatorDto,
    description: 'Emulator Create'
  })
  @UseGuards(EmulatorAdmin)
  @ApiConsumes('application/json', 'text/plain')
  create(@Body() createUserDto: EmulatorDto, @Req() authUser: AuthUser) {
    return this.emulatorService.create(createUserDto, authUser.user.sub);
  }

  @Put(':id')
  @ApiBody({
    type: EmulatorDto,
    description: 'Emulator Update'
  })
  @UseGuards(EmulatorAdmin)
  @ApiConsumes('application/json', 'text/plain')
  update(@Param('id') id: string, @Body() updateUserDto: Partial<EmulatorDto>, @Req() authUser: AuthUser) {
    return this.emulatorService.update(id, updateUserDto, authUser.user.sub);
  }

  @Delete(':id')
  @ApiConsumes('application/json', 'text/plain')
  @UseGuards(EmulatorAdmin)
  delete(@Param('id') id: number) {
    return this.emulatorService.remove(id);
  }

  @ApiBody({
    type: EmulatorLinkDto,
    description: 'Emulator link dto'
  })
  @UseGuards(SuperAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('link-emulator')
  linkEmulator(@Body() emulatorLinkDto: EmulatorLinkDto, @Req() authUser: AuthUser) {
    return this.emulatorService.linkEmulator(emulatorLinkDto, authUser.user.sub);
  }

  @Post('upload/screenshot')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path
    };
  }
}
