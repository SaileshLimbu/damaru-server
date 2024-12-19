import { Users } from '../entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create.user.dto';
import { AccountsService } from '../../accounts/services/account.service';
import { StringUtils } from '../../../common/utils/string.utils';
import { ActivityLogService } from '../../activity_logs/services/activity_log.service';
import { Actions } from '../../activity_logs/enums/Actions';
import { HashUtils } from '../../../common/utils/hash.utils';
import { Role as RoleEntity } from '../entities/role.entity';
import { Roles } from '../enums/roles';

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

  async create(user: CreateUserDto) {
    const role = await this.roleRepository.findOne({ where: { name: user.role.toString() } });
    const newPassword = user.password ?? StringUtils.generateRandomAlphaNumeric(8);
    const newUser = await this.usersRepository.insert({
      ...user,
      password: await HashUtils.hash(newPassword),
      role: { id: role.id }
    });
    const userId: number = newUser?.identifiers[0]?.id as number;
    await this.activityLogService.log({ user_id: userId, action: Actions.CREATE_USER, metadata: user });
    if (user.role === Roles.AndroidUser) {
      const account = { userId, account_name: user.name, pin: StringUtils.generateRandomNumeric(), is_admin: true, last_login: null };
      const newAccount: InsertResult = await this.accountService.create(account);
      const accountId: number = newAccount.identifiers[0].id as number;
      await this.activityLogService.log({
        user_id: userId,
        action: Actions.CREATE_ACCOUNT,
        account_id: accountId,
        metadata: account
      });
    }
    return { ...(await this.findOne(userId)), password: newPassword };
  }

  async update(id: number, user: Partial<CreateUserDto>) {
    const updatedUser = {};
    if (user.role) {
      throw new BadRequestException('Role cannot be updated');
    }
    if (user.password) {
      updatedUser['password'] = HashUtils.hash(user.password);
    }
    if (user.name) {
      updatedUser['name'] = user.name;
    }
    if (user.email) {
      updatedUser['email'] = user.email;
    }
    await this.activityLogService.log({ user_id: id, action: Actions.UPDATE_USER, metadata: updatedUser });
    return await this.usersRepository.update(id, updatedUser);
  }

  findAll(): Promise<Users[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<Users | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { accounts: true }
    });
  }

  async remove(id: number): Promise<void> {
    await this.activityLogService.log({ user_id: id, action: Actions.DELETE_USER, metadata: { id } });
    await this.usersRepository.delete(id);
  }
}
