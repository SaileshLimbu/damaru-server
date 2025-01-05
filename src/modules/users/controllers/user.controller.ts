import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos/create.user.dto';
import { Roles } from '../enums/roles';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { SuperAdmin } from '../../../core/guards/super_admin.guard';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';

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
  @ApiConsumes('application/json', 'text/plain')
  findAll(): Promise<DamaruResponse> {
    return this.userServices.findAll();
  }

  @Post()
  @ApiConsumes('application/json', 'text/plain')
  @ApiBody({
    type: CreateUserDto,
    description: 'User Create'
  })
  create(@Body() createUserDto: CreateUserDto): Promise<DamaruResponse> {
    return this.userServices.create({ ...createUserDto, role: createUserDto.role ?? Roles.AndroidUser });
  }

  @Put(':id')
  @ApiConsumes('application/json', 'text/plain')
  @ApiBody({
    type: CreateUserDto,
    description: 'User Update'
  })
  update(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>): Promise<DamaruResponse> {
    return this.userServices.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiConsumes('application/json', 'text/plain')
  delete(@Param('id') id: string): Promise<DamaruResponse> {
    return this.userServices.remove(id);
  }
}
