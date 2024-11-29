import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AccountsService } from '../services/account.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateAccountDto } from '../dtos/create.account.dto';

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
    description: 'Account Create',
  })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Put(':id')
  @ApiBody({
    type: CreateAccountDto,
    description: 'Update Create',
  })
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: Partial<CreateAccountDto>,
  ) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.accountsService.remove(id);
  }
}
