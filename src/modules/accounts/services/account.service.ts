import { Account } from '../entities/account.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from '../dtos/create.account.dto';
import { StringUtils } from '../../../common/utils/string.utils';
import { DateUtils } from '../../../common/utils/date.utils';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  create(createAccountDto: CreateAccountDto) {
    return this.accountRepository.insert({
      account_name: createAccountDto.account_name,
      pin: StringUtils.generateRandomNumeric(5),
      is_admin: false,
      user: { id: createAccountDto.userId },
    });
  }

  update(id: string, updateAccountDto: Partial<CreateAccountDto>) {
    let updateFields = {};
    if (updateAccountDto.account_name) {
      updateFields = {
        ...updateFields,
        account_name: updateAccountDto.account_name,
      };
    }
    if (updateAccountDto.pin) {
      updateFields = {
        ...updateFields,
        pin: updateAccountDto.pin,
      };
    }
    if (updateAccountDto.userId) {
      // todo check if we need this or not
      updateFields = {
        ...updateFields,
        user: { id: updateAccountDto.userId },
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
