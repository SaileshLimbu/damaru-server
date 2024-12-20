import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtToken } from '../interfaces/jwt_token';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../users/entities/user.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { HashUtils } from '../../../common/utils/hash.utils';
import { Roles, SubRoles } from '../../users/enums/roles';
import { Account } from '../../accounts/entities/account.entity';
import { DateUtils } from '../../../common/utils/date.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>
  ) {}

  async validateUser(loginDto: LoginDto): Promise<{ jwtPayload; firstLogin }> {
    let firstLogin = false;
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      relations: { accounts: true, role: true }
    }  as FindManyOptions<Users>);
    if (loginDto?.password && user && (await HashUtils.compareHash(loginDto.password, user.password))) {
      console.log({ user });
      let jwtPayload: JwtToken = {
        sub: null,
        email: null,
        role: null,
        accountName: null,
        subRole: null,
        accountId: null
      };
      if (user.role.name === Roles.AndroidUser.toString()) {
        user.accounts.some((account) => {
          if (loginDto.pin == account.pin) {
            firstLogin = account.first_login;
            this.accountRepository.update(account.id, { last_login: DateUtils.today() });
            jwtPayload = {
              sub: user.id,
              accountName: account.account_name,
              email: user.email,
              role: user.role.name,
              accountId: account.id,
              subRole: account.is_admin ? SubRoles.AndroidAdmin : SubRoles.AndroidAccount
            };
          }
        });
        if (!jwtPayload.accountName) {
          throw new UnauthorizedException('Invalid account or pin');
        }
      } else {
        jwtPayload = {
          sub: user.id,
          email: user.email,
          role: user.role.name
        };
      }
      return { jwtPayload, firstLogin };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginDto: LoginDto) {
    const { jwtPayload, firstLogin } = await this.validateUser(loginDto);
    const token = this.jwtService.sign(jwtPayload);
    return { accessToken: token, firstLogin };
  }
}
