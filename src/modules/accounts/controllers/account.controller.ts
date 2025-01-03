import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AccountsService } from '../services/account.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from '../dtos/create.account.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { AndroidAdmin } from '../../../core/guards/android_admin.guard';
import { AuthUser } from '../../../common/interfaces/AuthUser';
import { AndroidUsers } from '../../../core/guards/android_user.guard';

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
  findAll(@Req() authUser: AuthUser) {
    return this.accountsService.findAll(authUser.user);
  }

  @Post()
  @UseGuards(AndroidAdmin)
  @ApiBody({
    type: CreateAccountDto,
    description: 'Account Create'
  })
  @ApiOperation({ description: 'Root user can only create new accounts' })
  @ApiConsumes('application/json', 'text/plain')
  create(@Body() createAccountDto: CreateAccountDto, @Req() authUser: AuthUser) {
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
  update(@Param('id') id: number, @Body() updateAccountDto: Partial<CreateAccountDto>, @Req() authUser: AuthUser) {
    return this.accountsService.update(parseInt(id.toString(), 10), updateAccountDto, authUser.user);
  }

  @Delete(':id')
  @UseGuards(AndroidUsers)
  @ApiConsumes('application/json', 'text/plain')
  delete(@Param('id') id: number, @Req() authUser: AuthUser) {
    return this.accountsService.remove(parseInt(id.toString(), 10), authUser.user);
  }
}
