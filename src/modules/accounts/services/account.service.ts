import { Account } from '../entities/account.entity';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateAccountDto } from '../dtos/create.account.dto';
import { DateUtils } from '../../../common/utils/date.utils';
import { StringUtils } from '../../../common/utils/string.utils';
import { Roles, SubRoles } from '../../users/enums/roles';
import { JwtToken } from '../../auth/interfaces/jwt_token';
import { Utils } from '../../../common/utils/utils';
import { ConfigService } from '@nestjs/config';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';

/**
 * Service for managing accounts, including creation, retrieval, updating, and deletion,
 * while enforcing role-based access control.
 */
@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly configService: ConfigService
  ) {}

  /**
   * Creates a new account for a user, ensuring only one admin account per user if applicable.
   * @param createAccountDto - The DTO containing account creation details.
   * @returns The created account with its ID included.
   * @throws HttpException if an admin account already exists for the user.
   */
  async create(createAccountDto: CreateAccountDto): Promise<DamaruResponse> {
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
      is_admin: createAccountDto.is_admin,
      first_login: createAccountDto.is_admin
    };
    const accountCreated = await this.accountRepository.insert(account);
    account['id'] = accountCreated.identifiers[0].id as number;
    return { data: account };
  }

  /**
   * Retrieves the user associated with a specific account.
   * @param accountId - The ID of the account.
   * @returns The user associated with the account.
   */
  findUserByAccount(accountId: string) {
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
  async update(id: string, updateAccountDto: Partial<CreateAccountDto>, jwt: JwtToken): Promise<DamaruResponse> {
    const accountBelongToUser = await this.findUserByAccount(id);
    if (!accountBelongToUser) throw new NotFoundException('Account not found');
    if (jwt.role === Roles.SuperAdmin || (accountBelongToUser?.user?.id === jwt.sub && jwt.subRole === SubRoles.AndroidAdmin)) {
      const updateFields: Partial<CreateAccountDto & { updated_at: Date; first_login?: boolean }> = {};

      if (updateAccountDto.account_name) {
        updateFields.account_name = updateAccountDto.account_name;
      }
      if (updateAccountDto.pin) {
        const pinExist = await this.accountRepository.findOne({
          where: {
            user: { id: accountBelongToUser?.user?.id },
            pin: updateAccountDto.pin
          }
        });
        if (pinExist) {
          throw new BadRequestException('This PIN is already in use by another account. Please choose a different PIN.');
        }
        updateFields.pin = updateAccountDto.pin;
        updateFields.first_login = false;

        updateFields.updated_at = DateUtils.today();
      }
      await this.accountRepository.update(id, updateFields);
      return { message: 'Account updated', data: updateFields };
    } else {
      throw new UnauthorizedException('You cannot update an account you do not own');
    }
  }

  /**
   * Retrieves all accounts associated with the user based on their role and permissions.
   * @param jwtPayload - JWT token containing the user's roles and permissions.
   * @returns A list of accounts visible to the user.
   */
  async findAll(jwtPayload: JwtToken): Promise<DamaruResponse> {
    if (jwtPayload.subRole === SubRoles.AndroidAdmin) {
      return {
        data: await this.accountRepository.find({
          where: { user: { id: jwtPayload.sub } }
        } as FindManyOptions<Account>)
      };
    } else if (jwtPayload.role === Roles.SuperAdmin) {
      return {
        data: await this.accountRepository.find()
      };
    } else {
      return {
        data: await this.accountRepository.find({
          where: {
            user: { id: jwtPayload.sub },
            id: jwtPayload.accountId
          }
        } as FindManyOptions<Account>)
      };
    }
  }

  /**
   * Finds an account by its ID.
   * @param id - The ID of the account.
   * @param token jwt token details of the requesting user
   * @returns The account entity or null if not found.
   */
  async findOne(id: string, token: JwtToken): Promise<DamaruResponse> {
    const accountDetails = await this.accountRepository.findOne({
      where: { id: id},
      relations: { user: true, devices: { userEmulator: { device: true } } }
    });

    if (!accountDetails) throw new NotFoundException('Account not found');
    if (!(token.role === Roles.SuperAdmin || token.sub === accountDetails.user.id))
      throw new UnauthorizedException('You are not authorized to view this account');
    const devices = [];

    accountDetails.devices.filter((device)=> !device.userEmulator.unlinked_at).map((device) => {
      device.userEmulator.device.screenshot =
        device.userEmulator.device.screenshot ?? Utils.getDefaultScreenShot(this.configService.get('SCREENSHOT_URL'));
      const expiresAt = device.userEmulator.expires_at;
      devices.push({ ...device.userEmulator.device, expires_at: DateUtils.diffInDays(expiresAt, DateUtils.today()) });
    });
    return { data: devices };
  }

  /**
   * Retrieves the root admin account for a specific user.
   * @param userId - The ID of the user.
   * @returns The root admin account for the user.
   */
  findRootAccount(userId: string): Promise<Account> {
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
  async remove(id: string, payload: JwtToken): Promise<DamaruResponse> {
    const accountUser = await this.findUserByAccount(id);
    if (!accountUser) throw new NotFoundException('Account not found');
    if (
      payload.role === Roles.SuperAdmin ||
      (accountUser?.user?.id === payload.sub && (payload.subRole === SubRoles.AndroidAdmin || id === payload.accountId))
    ) {
      await this.accountRepository.delete(id);
      return { message: 'Account Deleted' };
    } else {
      throw new UnauthorizedException('You cannot delete an account you do not own');
    }
  }
}
