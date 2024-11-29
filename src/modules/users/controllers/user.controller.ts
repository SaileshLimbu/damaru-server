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
import { UsersService } from '../services/user.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos/create.user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userServices: UsersService) {}

  /**
   * Retrieves all users.
   *
   * @returns An array of all user objects
   */
  @Get()
  findAll() {
    return this.userServices.findAll();
  }

  @Post()
  @ApiBody({
    type: CreateUserDto,
    description: 'User Create',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userServices.create(createUserDto);
  }

  @Put(':id')
  @ApiBody({
    type: CreateUserDto,
    description: 'User Update',
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return this.userServices.update(id, updateUserDto);
  }

  @Get('login')
  login(@Query('googleToken') googleToken: string) {
    return this.userServices.login(googleToken);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.userServices.remove(id);
  }
}
