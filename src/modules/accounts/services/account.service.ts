import { Account } from '../entities/account.entity';
import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateAccountDto } from '../dtos/create.account.dto';
import { DateUtils } from '../../../common/utils/date.utils';
import { StringUtils } from '../../../common/utils/string.utils';
import { Roles, SubRoles } from '../../users/enums/roles';
import { JwtToken } from '../../auth/interfaces/jwt_token';

/**
 * Service for managing accounts, including creation, retrieval, updating, and deletion,
 * while enforcing role-based access control.
 */
@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>
  ) {}

  /**
   * Creates a new account for a user, ensuring only one admin account per user if applicable.
   * @param createAccountDto - The DTO containing account creation details.
   * @returns The created account with its ID included.
   * @throws HttpException if an admin account already exists for the user.
   */
  async create(createAccountDto: CreateAccountDto) {
    if (createAccountDto.is_admin) {
      const existingAdminAccounts = await this.accountRepository.find({
        where: {
          is_admin: true,
          user: { id: createAccountDto.userId }
        },
        relations: { user: true }
      } as FindManyOptions<Account>);
      if (existingAdminAccounts.length > 0) {
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
      pin: createAccountDto.pin ?? StringUtils.generateRandomNumeric(5),
      user: { id: createAccountDto.userId },
      is_admin: createAccountDto.is_admin
    };
    const accountCreated = await this.accountRepository.insert(account);
    account['id'] = accountCreated.identifiers[0].id as number;
    return account;
  }

  /**
   * Retrieves the user associated with a specific account.
   * @param accountId - The ID of the account.
   * @returns The user associated with the account.
   */
  findUserByAccount(accountId: number) {
    return this.accountRepository.findOne({
      where: { id: accountId },
      select: { user: { id: true } },
      relations: { user: true }
    } as FindOneOptions<Account>);
  }

  /**
   * Updates an account's details, ensuring the user has the necessary permissions.
   * @param id - The ID of the account to update.
   * @param updateAccountDto - DTO containing the updated account details.
   * @param jwt - JWT token of the requesting user.
   * @returns A message indicating the update status and the updated fields.
   * @throws UnauthorizedException if the user is not authorized to update the account.
   */
  async update(id: number, updateAccountDto: Partial<CreateAccountDto>, jwt: JwtToken) {
    const accountBelongToUser = await this.findUserByAccount(id);
    if (!accountBelongToUser) throw new NotFoundException('Account not found');
    if (jwt.role === Roles.SuperAdmin || accountBelongToUser?.user?.id === jwt.sub) {
      if (
        jwt.role === Roles.SuperAdmin ||
        jwt.subRole === SubRoles.AndroidAdmin ||
        (jwt.subRole === SubRoles.AndroidAccount && id === jwt.accountId)
      ) {
        const updateFields: Partial<CreateAccountDto & { updated_at: Date; first_login?: boolean }> = {};

        if (updateAccountDto.account_name) {
          updateFields.account_name = updateAccountDto.account_name;
        }
        if (updateAccountDto.pin) {
          updateFields.pin = updateAccountDto.pin;
          updateFields.first_login = false;
        }

        updateFields.updated_at = DateUtils.today();

        await this.accountRepository.update(id, updateFields);
        return { message: 'Account updated', updated: updateFields };
      } else {
        throw new UnauthorizedException('You are not authorized to update this account');
      }
    } else {
      throw new UnauthorizedException('You cannot update an account you do not own');
    }
  }

  /**
   * Retrieves all accounts associated with the user based on their role and permissions.
   * @param jwtPayload - JWT token containing the user's roles and permissions.
   * @returns A list of accounts visible to the user.
   */
  findAll(jwtPayload: JwtToken): Promise<Account[]> {
    if (jwtPayload.subRole === SubRoles.AndroidAdmin) {
      return this.accountRepository.find({
        where: { user: { id: jwtPayload.sub } }
      } as FindManyOptions<Account>);
    } else {
      return this.accountRepository.find({
        where: {
          user: { id: jwtPayload.sub },
          id: jwtPayload.accountId
        }
      } as FindManyOptions<Account>);
    }
  }

  /**
   * Finds an account by its ID.
   * @param id - The ID of the account.
   * @returns The account entity or null if not found.
   */
  findOne(id: number): Promise<Account | null> {
    return this.accountRepository.findOneBy({ id });
  }

  /**
   * Retrieves the root admin account for a specific user.
   * @param userId - The ID of the user.
   * @returns The root admin account for the user.
   */
  findRootAccount(userId: number): Promise<Account> {
    return this.accountRepository.findOne({
      where: { user: { id: userId }, is_admin: true },
      relations: { user: true }
    } as FindOneOptions<Account>);
  }

  /**
   * Deletes an account, ensuring the requesting user has the necessary permissions.
   * @param id - The ID of the account to delete.
   * @param payload - JWT token of the requesting user.
   * @returns json {status: OK, message: Account Deleted}
   * @throws UnauthorizedException if the user is not authorized to delete the account.
   */
  async remove(id: number, payload: JwtToken) {
    const accountUser = await this.findUserByAccount(id);
    if (!accountUser) throw new NotFoundException('Account not found');
    if (
      payload.role === Roles.SuperAdmin ||
      (accountUser?.user?.id === payload.sub && (payload.subRole === SubRoles.AndroidAdmin || id === payload.accountId))
    ) {
      await this.accountRepository.delete(id);
      return { status: HttpStatus.OK, message: 'Account Deleted' };
    } else {
      throw new UnauthorizedException('You cannot delete an account you do not own');
    }
  }
}
