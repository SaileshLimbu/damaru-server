import { Users } from '../entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, In, IsNull, Not, Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create.user.dto';
import { AccountsService } from '../../accounts/services/account.service';
import { StringUtils } from '../../../common/utils/string.utils';
import { ActivityLogService } from '../../activity_logs/services/activity_log.service';
import { Actions } from '../../activity_logs/enums/Actions';
import { HashUtils } from '../../../common/utils/hash.utils';
import { Role as RoleEntity } from '../entities/role.entity';
import { Roles } from '../enums/roles';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly accountService: AccountsService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(user: CreateUserDto): Promise<DamaruResponse> {
    const role = await this.roleRepository.findOne({ where: { name: user.role.toString() } });
    const newPassword = user.password ?? StringUtils.generateRandomAlphaNumeric(8);
    const newUser = await this.usersRepository.insert({
      ...user,
      password: await HashUtils.hash(newPassword),
      role: { id: role.id }
    });
    const userId: string = newUser?.identifiers[0]?.id;
    await this.activityLogService.log({ user_id: userId, action: Actions.CREATE_USER, metadata: user });
    if (user.role === Roles.AndroidUser) {
      const account = {
        userId,
        account_name: user.name,
        pin: StringUtils.generateRandomNumeric(),
        is_admin: true,
        last_login: null
      };
      const newAccount = await this.accountService.create(account);
      const accountId: string = newAccount.data['id'];
      await this.activityLogService.log({
        user_id: userId,
        action: Actions.CREATE_ACCOUNT,
        account_id: accountId,
        metadata: account
      });
    }
    return { message: 'User has been created', data: { ...(await this.findOne(userId)), password: newPassword } };
  }

  async update(id: string, user: Partial<CreateUserDto>) {
    const updatedUser = {};
    if (user.role) {
      throw new BadRequestException('Role cannot be updated');
    }
    if (user.password) {
      updatedUser['password'] = await HashUtils.hash(user.password);
    }
    if (user.name) {
      updatedUser['name'] = user.name;
    }
    if (user.email) {
      updatedUser['email'] = user.email;
    }
    await this.activityLogService.log({ user_id: id, action: Actions.UPDATE_USER, metadata: updatedUser });
    await this.usersRepository.update(id, updatedUser);
    return { message: 'User details has been updated', data: updatedUser };
  }

  async findAll(): Promise<DamaruResponse> {
    const users = await this.usersRepository.find({
      relations: { accounts: true, emulators: true, role: true },
      where: { emulators: { unlinked_at: IsNull() }, role: { name: Not(In([Roles.SuperAdmin, Roles.EmulatorAdmin])) }},
      select: ['id', 'name', 'email']
    });
    return {
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        emulators: user.emulators,
        accountsCount: user.accounts.length,
        emulatorsCount: user.emulators.length,
        role: user.role.name,
        isSuperAdmin: user.role.name === Roles.SuperAdmin
      }))
    };
  }

  findOne(id: string): Promise<Users> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { accounts: true }
    } as FindOneOptions<Users>);
  }

  async remove(id: string): Promise<DamaruResponse> {
    await this.activityLogService.log({ user_id: id, action: Actions.DELETE_USER, metadata: { id } });
    await this.usersRepository.delete(id);
    return { message: 'User deleted' };
  }
}
