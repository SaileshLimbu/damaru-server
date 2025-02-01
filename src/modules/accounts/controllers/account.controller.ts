import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AccountsService } from '../services/account.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from '../dtos/create.account.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { AndroidAdmin } from '../../../core/guards/android_admin.guard';
import { AuthUser } from '../../../common/interfaces/AuthUser';
import { AndroidUsers } from '../../../core/guards/android_user.guard';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @UseGuards(AndroidUsers)
  @ApiOperation({ description: 'Root user can view all his accounts, normal user can only view his account' })
  @ApiConsumes('application/json', 'text/plain')
  @ApiHeader({ name: 'X-Metadata', description: 'Rsa encrypted key', })
  findAll(@Req() authUser: AuthUser): Promise<DamaruResponse> {
    return this.accountsService.findAll(authUser.user);
  }

  @Get(':id')
  @UseGuards(AndroidAdmin)
  @ApiOperation({ description: 'Root user can view account details' })
  @ApiConsumes('application/json', 'text/plain')
  @ApiHeader({ name: 'X-Metadata', description: 'Rsa encrypted key', })
  findOne(@Param('id') id: string, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    return this.accountsService.findOne(id, authUser.user);
  }

  @Post()
  @UseGuards(AndroidAdmin)
  @ApiOperation({ description: 'Root user can only create new accounts' })
  @ApiConsumes('application/json', 'text/plain')
  create(@Body() createAccountDto: CreateAccountDto, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    return this.accountsService.create({ ...createAccountDto, userId: authUser.user.sub });
  }

  @Put(':id')
  @ApiBody({
    type: CreateAccountDto,
    description: 'Update Create'
  })
  @ApiConsumes('application/json', 'text/plain')
  @UseGuards(AndroidUsers)
  @ApiOperation({ description: 'Root user can update his any accounts, normal user can update his account only' })
  update(@Param('id') id: string, @Body() updateAccountDto: Partial<CreateAccountDto>, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    return this.accountsService.update(id, updateAccountDto, authUser.user);
  }

  @Delete(':id')
  @UseGuards(AndroidUsers)
  @ApiConsumes('application/json', 'text/plain')
  @ApiHeader({ name: 'X-Metadata', description: 'Rsa encrypted key', })
  delete(@Param('id') id: string, @Req() authUser: AuthUser): Promise<DamaruResponse> {
    return this.accountsService.remove(id, authUser.user);
  }
}
