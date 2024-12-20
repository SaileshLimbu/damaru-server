import { Account } from '../entities/account.entity';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateAccountDto } from '../dtos/create.account.dto';
import { DateUtils } from '../../../common/utils/date.utils';
import { StringUtils } from '../../../common/utils/string.utils';
import { ActivityLogService } from '../../activity_logs/services/activity_log.service';
import { Actions } from '../../activity_logs/enums/Actions';
import { SubRoles } from '../../users/enums/roles';
import { JwtToken } from '../../auth/interfaces/jwt_token';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    if (createAccountDto.is_admin) {
      const account: Array<Account> = await this.accountRepository.find({
        where: {
          is_admin: true,
          user: { id: createAccountDto.userId }
        },
        relations: { user: true }
      } as FindManyOptions<Account>);
      if (account?.length > 0) {
        throw new HttpException(
          {
            statusCod: HttpStatus.FOUND,
            message: 'Admin account already found for this user'
          },
          HttpStatus.FOUND
        );
      }
    }

    const account = {
      account_name: createAccountDto.account_name,
      pin: StringUtils.generateRandomNumeric(5),
      user: { id: createAccountDto.userId },
      is_admin: createAccountDto.is_admin
    };
    const accountCreated = await this.accountRepository.insert(account);
    await this.activityLogService.log({
      user_id: createAccountDto.userId,
      account_id: accountCreated.identifiers[0].id as number,
      action: Actions.CREATE_ACCOUNT,
      metadata: account
    });
    return accountCreated;
  }

  findUserByAccount(accountId: number) {
    return this.accountRepository.findOne({
      where: { id: accountId },
      select: { user: { id: true } },
      relations: { user: true }
    } as FindOneOptions<Account>);
  }

  async update(id: number, updateAccountDto: Partial<CreateAccountDto>, userId: number) {
    const accountBelongToUser = await this.findUserByAccount(id);
    if (accountBelongToUser?.user?.id === userId) {
      let updateFields = {};
      if (updateAccountDto.account_name) {
        updateFields = {
          ...updateFields,
          account_name: updateAccountDto.account_name
        };
      }
      if (updateAccountDto.pin) {
        updateFields = {
          ...updateFields,
          pin: updateAccountDto.pin,
          firstLogin: false
        };
      }
      if (updateAccountDto.userId) {
        // todo check if we need this or not
        updateFields = {
          ...updateFields,
          user: { id: updateAccountDto.userId }
        };
      }
      updateFields = { ...updateFields, updated_at: DateUtils.today() };
      const accountUser = await this.findUserByAccount(id);
      await this.activityLogService.log({
        user_id: accountUser.user.id,
        account_id: id,
        action: Actions.UPDATE_ACCOUNT,
        metadata: updateFields
      });
      return this.accountRepository.update(id, updateFields);
    } else {
      throw new UnauthorizedException('You cannot update account that you do not owned');
    }
  }

  findAll(jwtPayload: JwtToken): Promise<Account[]> {
    if (jwtPayload.subRole === SubRoles.AndroidAdmin) {
      return this.accountRepository.find({ where: { user: { id: jwtPayload.sub } } } as FindManyOptions<Account>);
    } else {
      return this.accountRepository.find({
        where: {
          user: { id: jwtPayload.sub },
          id: jwtPayload.accountId
        }
      } as FindManyOptions<Account>);
    }
  }

  findOne(id: number): Promise<Account | null> {
    return this.accountRepository.findOneBy({ id });
  }

  async remove(id: number, userId: number): Promise<void> {
    const accountUser = await this.findUserByAccount(id);
    if (accountUser?.user?.id === userId) {
      await this.activityLogService.log({
        user_id: accountUser.user.id,
        account_id: id,
        action: Actions.DELETE_ACCOUNT,
        metadata: { id }
      });
      await this.accountRepository.delete(id);
    } else {
      throw new UnauthorizedException('You cannot delete account that you do not owned');
    }
  }
}
