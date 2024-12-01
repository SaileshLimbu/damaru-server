import { Account } from '../entities/account.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from '../dtos/create.account.dto';
import { DateUtils } from '../../../common/utils/date.utils';
import { StringUtils } from '../../../common/utils/string.utils';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    if (createAccountDto.is_admin) {
      const account: Array<Account> = await this.accountRepository.find({
        where: {
          is_admin: true,
          user: { id: createAccountDto.userId }
        },
        relations: { user: true }
      });
      if (account?.length > 0) {
        return await this.accountRepository.insert({
          account_name: createAccountDto.account_name,
          pin: StringUtils.generateRandomNumeric(5),
          user: { id: createAccountDto.userId },
          is_admin: createAccountDto.is_admin
        });
      } else {
        return { status: 302, message: 'You cannot set more than one admins' };
      }
    }
  }

  update(id: string, updateAccountDto: Partial<CreateAccountDto>) {
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
        pin: updateAccountDto.pin
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
    return this.accountRepository.update(id, updateFields);
  }

  findAll(): Promise<Account[]> {
    return this.accountRepository.find();
  }

  findOne(id: number): Promise<Account | null> {
    return this.accountRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.accountRepository.delete(id);
  }
}
