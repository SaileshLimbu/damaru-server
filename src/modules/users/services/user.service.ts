import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create.user.dto';
import { AccountsService } from '../../accounts/services/account.service';
import { StringUtils } from '../../../common/utils/string.utils';
import { ActivityLogService } from '../../activity_logs/services/activity_log.service';
import { Actions } from '../../activity_logs/enums/Actions';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly accountService: AccountsService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(user: CreateUserDto) {
    const newUser = await this.usersRepository.insert(user);
    const userId: number = newUser?.identifiers[0]?.id as number;
    const account = { userId, account_name: user.name, pin: StringUtils.generateRandomNumeric(), is_admin: true };
    const newAccount: InsertResult = await this.accountService.create(account);
    const accountId: number = newAccount.identifiers[0].id as number;
    await this.activityLogService.log({ user_id: userId, action: Actions.CREATE_USER, metadata: user });
    await this.activityLogService.log({
      user_id: userId,
      action: Actions.CREATE_ACCOUNT,
      account_id: accountId,
      metadata: account
    });
    return this.findOne(userId);
  }

  async update(id: number, user: Partial<CreateUserDto>) {
    await this.activityLogService.log({ user_id: id, action: Actions.UPDATE_USER, metadata: user });
    return this.usersRepository.update(id, user);
  }

  login(googleToken: string) {
    // verifies token
    // check if user exist
    // provides jwt token
    return this.usersRepository.find({
      where: { googleUserId: googleToken },
      relations: { accounts: true }
    });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
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
