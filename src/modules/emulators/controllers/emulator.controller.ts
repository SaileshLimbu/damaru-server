import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { ExcludeInterceptor } from '../../../core/middlewares/ExcludeEncryptionInterceptor';
import { AndroidAdmin } from '../../../core/guards/android_admin.guard';
import { EmulatorAssignDto } from '../dtos/emulator-assign.dto';
import { AccountEmulatorsAssignDto } from '../dtos/account-emulators-assign.dto';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';
import { ExtendExpiryDto } from '../dtos/extend-expiry.dto';

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
  findAll(@Req() authUser: AuthUser): Promise<DamaruResponse> {
    return this.emulatorService.findAll(authUser.user);
  }

  @Get('linkedAccounts')
  @UseGuards(AndroidAdmin)
  @ApiOperation({ description: 'Android users or Emulator Admin can view emulators' })
  @ApiConsumes('application/json', 'text/plain')
  findLinkAccounts(@Query('deviceId') deviceId: string): Promise<DamaruResponse> {
    return this.emulatorService.findLinkedDevices(deviceId);
  }

  @Post()
  @ApiBody({
    type: EmulatorDto,
    description: 'Emulator Create'
  })
  @UseGuards(EmulatorAdmin)
  @ApiConsumes('application/json', 'text/plain')
  create(@Body() createUserDto: EmulatorDto, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    return this.emulatorService.create(createUserDto, authUser.user.sub);
  }

  @ExcludeInterceptor()
  @Post(':deviceId/screenshot')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(EmulatorAdmin)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } }
    }
  })
  async uploadFile(@Param('deviceId') deviceId: string, @UploadedFile() file: Express.Multer.File): Promise<DamaruResponse> {
    const emulator = await this.emulatorService.linkScreenshot(deviceId);
    return {
      message: 'File uploaded successfully',
      data: {
        originalName: file.originalname,
        savedFileName: file.filename,
        path: file.path,
        link: emulator.screenshot
      }
    };
  }

  @Put(':id')
  @ApiBody({
    type: EmulatorDto,
    description: 'Emulator Update'
  })
  @UseGuards(EmulatorAdmin)
  @ApiConsumes('application/json', 'text/plain')
  update(@Param('id') id: string, @Body() updateUserDto: Partial<EmulatorDto>): Promise<DamaruResponse> {
    return this.emulatorService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiConsumes('application/json', 'text/plain')
  @UseGuards(EmulatorAdmin)
  delete(@Param('id') id: string): Promise<DamaruResponse> {
    return this.emulatorService.remove(id);
  }

  @ApiBody({
    type: EmulatorLinkDto,
    description: 'Emulator link dto'
  })
  @UseGuards(SuperAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('link-emulator')
  async linkEmulator(@Body() emulatorLinkDto: EmulatorLinkDto): Promise<DamaruResponse> {
    await this.emulatorService.linkEmulator(emulatorLinkDto);
    return {
      message: `Device with id:${emulatorLinkDto.device_id} linked with userId: ${emulatorLinkDto.user_id}`
    };
  }

  @ApiBody({
    type: ExtendExpiryDto,
    description: 'Emulator extend expiry date dto'
  })
  @UseGuards(SuperAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('extend-expiry')
  async extendExpiry(@Body() extendExpiryDto: ExtendExpiryDto): Promise<DamaruResponse> {
    await this.emulatorService.extend(extendExpiryDto);
    return {
      message: `Extended emulator expiry date`
    };
  }

  @ApiBody({
    type: EmulatorAssignDto,
    description: 'Assign emulator to multiple accounts dto'
  })
  @UseGuards(AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('assign-multi-accounts')
  async assignEmulator(@Body() emulatorLinkDto: EmulatorAssignDto, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    await this.emulatorService.assignEmulator(emulatorLinkDto, authUser.user);
    return {
      message: 'Device has been assigned to multiple accounts'
    };
  }

  @ApiBody({
    type: AccountEmulatorsAssignDto,
    description: 'Assign emulators to one account dto'
  })
  @UseGuards(AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('assign-multi-emulators')
  async assignEmulatorsToAccount(@Body() emulatorLinkDto: AccountEmulatorsAssignDto, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    await this.emulatorService.assignEmulatorsToAccount(emulatorLinkDto, authUser.user);
    return {
      message: 'Devices have been assigned to an account'
    };
  }

  @ApiBody({
    type: AccountEmulatorsAssignDto,
    description: 'Unassign emulators to one account dto'
  })
  @UseGuards(AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('unassign-multi-emulators')
  async unAssignEmulatorsToAccount(@Body() emulatorLinkDto: AccountEmulatorsAssignDto, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    await this.emulatorService.unassignEmulatorsToAccount(emulatorLinkDto, authUser.user);
    return {
      message: `Devices have been unassigned to an account`
    };
  }

  @ApiBody({
    type: EmulatorAssignDto,
    description: 'Unassign emulator from multiple account dto'
  })
  @UseGuards(AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('unassign-multi-accounts')
  async unAssignEmulatorFromAccounts(@Body() emulatorLinkDto: EmulatorAssignDto): Promise<DamaruResponse> {
    await this.emulatorService.unassignEmulatorFromAccounts(emulatorLinkDto);
    return {
      message: `Device have been unassigned from accounts`
    };
  }
}
