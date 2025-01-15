import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmulatorDto } from '../dtos/emulator.dto';
import { EmulatorService } from '../services/emulator.service';
import { MultiDevicesLinkDto } from '../dtos/multi-devices-link.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { AuthUser } from '../../../common/interfaces/AuthUser';
import { EmulatorUsers } from '../../../core/guards/emulator_user.guard';
import { EmulatorAdmin } from '../../../core/guards/emulator_admin.guard';
import { SuperAdmin } from '../../../core/guards/super_admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcludeInterceptor } from '../../../core/middlewares/ExcludeEncryptionInterceptor';
import { AndroidAdmin } from '../../../core/guards/android_admin.guard';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';
import { ExtendExpiryDto } from '../dtos/extend-expiry.dto';
import { MultiAccountsLinkDto } from '../dtos/multi-accounts.link.dto';
import { MultiDevicesAccountLinkDto } from '../dtos/multi-devices-account-link.dto';

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
  @UseGuards(EmulatorAdmin, AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  update(@Param('id') id: string, @Body() updateUserDto: Partial<EmulatorDto>, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    return this.emulatorService.update(id, updateUserDto, authUser.user);
  }

  @Delete(':id')
  @ApiConsumes('application/json', 'text/plain')
  @UseGuards(EmulatorAdmin)
  delete(@Param('id') id: string): Promise<DamaruResponse> {
    return this.emulatorService.remove(id);
  }

  @ApiBody({
    type: MultiDevicesLinkDto,
    description: 'Emulator link dto'
  })
  @UseGuards(SuperAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('link-emulators')
  async linkEmulator(@Body() emulatorLinkDto: MultiDevicesLinkDto): Promise<DamaruResponse> {
    await this.emulatorService.linkEmulator(emulatorLinkDto);
    return {
      message: `Device linked with userId: ${emulatorLinkDto.userId}`
    };
  }

  @ApiBody({
    type: MultiDevicesLinkDto,
    description: 'Emulator link dto'
  })
  @UseGuards(SuperAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('unlink-emulators')
  async unlinkEmulator(@Body() emulatorLinkDto: MultiDevicesLinkDto): Promise<DamaruResponse> {
    await this.emulatorService.unlinkEmulator(emulatorLinkDto);
    return {
      message: `Device unlinked with userId: ${emulatorLinkDto.userId}`
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

  @UseGuards(AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Get('connection-log')
  async connectionLog(@Query('accountId') accountId: string, @Query('deviceId') deviceId: string): Promise<DamaruResponse> {
    return await this.emulatorService.connectionLog(accountId, deviceId);
  }

  @ApiBody({
    type: MultiAccountsLinkDto,
    description: 'Assign emulator to multiple accounts dto'
  })
  @UseGuards(AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('assign-multi-accounts')
  async assignEmulator(@Body() emulatorLinkDto: MultiAccountsLinkDto, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    await this.emulatorService.assignEmulator(emulatorLinkDto, authUser.user);
    return {
      message: 'Device has been assigned to multiple accounts'
    };
  }

  @ApiBody({
    type: MultiDevicesAccountLinkDto,
    description: 'Assign emulators to one account dto'
  })
  @UseGuards(AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('assign-multi-emulators')
  async assignEmulatorsToAccount(@Body() emulatorLinkDto: MultiDevicesAccountLinkDto, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    await this.emulatorService.assignEmulatorsToAccount(emulatorLinkDto, authUser.user);
    return {
      message: 'Devices have been assigned to an account'
    };
  }

  @ApiBody({
    type: MultiDevicesAccountLinkDto,
    description: 'Unassign emulators to one account dto'
  })
  @UseGuards(AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('unassign-multi-emulators')
  async unAssignEmulatorsToAccount(
    @Body() emulatorLinkDto: MultiDevicesAccountLinkDto,
    @Req() authUser: AuthUser
  ): Promise<DamaruResponse> {
    await this.emulatorService.unassignEmulatorsToAccount(emulatorLinkDto, authUser.user);
    return {
      message: `Devices have been unassigned to an account`
    };
  }

  @ApiBody({
    type: MultiAccountsLinkDto,
    description: 'Unassign emulator from multiple account dto'
  })
  @UseGuards(AndroidAdmin)
  @ApiConsumes('application/json', 'text/plain')
  @Post('unassign-multi-accounts')
  async unAssignEmulatorFromAccounts(@Body() emulatorLinkDto: MultiAccountsLinkDto): Promise<DamaruResponse> {
    await this.emulatorService.unassignEmulatorFromAccounts(emulatorLinkDto);
    return {
      message: `Device have been unassigned from accounts`
    };
  }
}
