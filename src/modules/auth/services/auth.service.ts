import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtToken } from '../interfaces/jwt_token';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashUtils } from '../../../common/utils/hash.utils';
import { Roles, SubRoles } from '../../users/enums/roles';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async validateUser(loginDto: LoginDto): Promise<JwtToken> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      relations: { accounts: true, role: true }
    });
    if (loginDto?.password && user && (await HashUtils.compareHash(loginDto.password, user.password))) {
      console.log({ user });
      let jwtPayload: JwtToken = { sub: null, email: null, role: null, account: null, subRole: null };
      if (user.role.name === Roles.AndroidUser.toString()) {
        user.accounts.some((account) => {
          if (loginDto.pin == account.pin) {
            jwtPayload = {
              sub: user.id,
              account: account.account_name,
              email: user.email,
              role: user.role.name,
              subRole: account.is_admin ? SubRoles.AndroidAdmin : SubRoles.AndroidAccount
            };
          }
        });
        if (!jwtPayload.account) {
          throw new UnauthorizedException('Invalid account or pin');
        }
      } else {
        jwtPayload = {
          sub: user.id,
          email: user.email,
          role: user.role.name
        };
      }
      return jwtPayload;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginDto: LoginDto) {
    const validatedUser = await this.validateUser(loginDto);
    const token = this.jwtService.sign(validatedUser);
    return { accessToken: token };
  }
}
