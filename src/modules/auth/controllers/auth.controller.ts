import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt.guard';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';
import { ExcludeInterceptor } from '../../../core/middlewares/ExcludeEncryptionInterceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({
    type: LoginDto,
    description: 'Login Dto'
  })
  @ApiConsumes('application/json', 'text/plain')
  async login(@Body() loginDto: LoginDto): Promise<DamaruResponse> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ExcludeInterceptor()
  @ApiConsumes('application/json', 'text/plain')
  @Get('check')
  checkAuth(@Req() req: Request): DamaruResponse {
    const user = req.user; // The JWT payload is attached to the `user` property
    return { message: 'User is authenticated', data: { ...user } };
  }
}
