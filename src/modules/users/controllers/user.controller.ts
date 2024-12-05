import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos/create.user.dto';
import { Roles } from '../enums/roles';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { SuperAdmin } from '../../../core/guards/super_admin.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdmin)
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
    description: 'User Create'
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userServices.create({ ...createUserDto, role: createUserDto.role ?? Roles.AndroidUser });
  }

  @Put(':id')
  @ApiBody({
    type: CreateUserDto,
    description: 'User Update'
  })
  update(@Param('id') id: number, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.userServices.update(id, updateUserDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.userServices.remove(id);
  }
}
