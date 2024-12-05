import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AccountsService } from '../services/account.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from '../dtos/create.account.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { AndroidAdmin } from '../../../core/guards/android_admin.guard';
import { AuthUser } from '../../../common/interfaces/AuthUser';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AndroidAdmin)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * Retrieves all users.
   *
   * @returns An array of all user objects
   */
  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Post()
  @ApiBody({
    type: CreateAccountDto,
    description: 'Account Create'
  })
  create(@Body() createAccountDto: CreateAccountDto, @Req() authUser: AuthUser) {
    return this.accountsService.create({ ...createAccountDto, userId: authUser.user.sub });
  }

  @Put(':id')
  @ApiBody({
    type: CreateAccountDto,
    description: 'Update Create'
  })
  update(@Param('id') id: number, @Body() updateAccountDto: Partial<CreateAccountDto>) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.accountsService.remove(id);
  }
}
