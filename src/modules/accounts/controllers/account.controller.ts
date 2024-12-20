import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AccountsService } from '../services/account.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from '../dtos/create.account.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { AndroidAdmin } from '../../../core/guards/android_admin.guard';
import { AuthUser } from '../../../common/interfaces/AuthUser';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * Retrieves all users.
   *
   * @returns An array of all user objects
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('application/json', 'text/plain')
  findAll(@Req() authUser: AuthUser) {
    return this.accountsService.findAll(authUser.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AndroidAdmin)
  @ApiBody({
    type: CreateAccountDto,
    description: 'Account Create'
  })
  @ApiConsumes('application/json', 'text/plain')
  create(@Body() createAccountDto: CreateAccountDto, @Req() authUser: AuthUser) {
    return this.accountsService.create({ ...createAccountDto, userId: authUser.user.sub });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    type: CreateAccountDto,
    description: 'Update Create'
  })
  @ApiConsumes('application/json', 'text/plain')
  update(@Param('id') id: number, @Body() updateAccountDto: Partial<CreateAccountDto>, @Req() authUser: AuthUser) {
    return this.accountsService.update(id, updateAccountDto, authUser.user.sub);
  }

  @Delete(':id')
  @ApiConsumes('application/json', 'text/plain')
  delete(@Param('id') id: number, @Req() authUser: AuthUser) {
    return this.accountsService.remove(id, authUser.user.sub);
  }
}
