import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create.user.dto';
import { AccountsService } from '../../accounts/services/account.service';
import { StringUtils } from '../../../common/utils/string.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly accountService: AccountsService
  ) {}

  async create(user: CreateUserDto) {
    const newUser = await this.usersRepository.insert(user);
    const userId: number = newUser?.identifiers[0]?.id as number;
    await this.accountService.create({
      userId,
      account_name: user.name,
      pin: StringUtils.generateRandomNumeric(),
      is_admin: true
    });
    return this.findOne(userId);
  }

  update(id: string, user: Partial<CreateUserDto>) {
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
    await this.usersRepository.delete(id);
  }
}
