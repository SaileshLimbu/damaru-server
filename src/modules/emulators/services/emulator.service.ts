import { Emulator } from '../entities/emulator.entity';
import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, IsNull, Repository } from 'typeorm';
import { EmulatorDto } from '../dtos/emulator.dto';
import { EmulatorStatus } from '../interfaces/emulator.status';
import { UserEmulators } from '../entities/user-emulators';
import { DateUtils } from '../../../common/utils/date.utils';
import { MultiDevicesLinkDto } from '../dtos/multi-devices-link.dto';
import { Actions } from '../../activity_logs/enums/Actions';
import { JwtToken } from '../../auth/interfaces/jwt_token';
import { Roles, SubRoles } from '../../users/enums/roles';
import { ConfigService } from '@nestjs/config';
import { EmulatorState } from '../interfaces/emulator.state';
import { AccountEmulators } from '../entities/account-emulators';
import { AccountStatus } from '../interfaces/account.status';
import { AccountsService } from '../../accounts/services/account.service';
import { Utils } from '../../../common/utils/utils';
import { DamaruResponse } from '../../../common/interfaces/DamaruResponse';
import { ExtendExpiryDto } from '../dtos/extend-expiry.dto';
import { EmulatorConnections } from '../entities/emulator-connections';
import { MultiAccountsLinkDto } from '../dtos/multi-accounts.link.dto';
import { MultiDevicesAccountLinkDto } from '../dtos/multi-devices-account-link.dto';

/**
 * EmulatorService is responsible for managing emulator-related operations,
 * including creation, updates, deletion, assignment, linking, and fetching of emulators.
 * It integrates with various repositories and services for logging activities,
 * managing user assignments, and ensuring proper emulator state transitions.
 */
@Injectable()
export class EmulatorService {
  constructor(
    @InjectRepository(Emulator)
    private readonly emulatorRepository: Repository<Emulator>,
    @InjectRepository(UserEmulators)
    private readonly userEmulatorRepository: Repository<UserEmulators>,
    @InjectRepository(AccountEmulators)
    private readonly accountEmulatorRepository: Repository<AccountEmulators>,
    @InjectRepository(EmulatorConnections)
    private readonly emulatorConnectionsRepository: Repository<EmulatorConnections>,
    private readonly configService: ConfigService,
    private readonly accountService: AccountsService
  ) {}

  /**
   * Creates a new emulator entity and logs its creation in the activity logs.
   * @param emulator - DTO containing details of the emulator to be created.
   * @param userId - ID of the user performing the creation.
   * @returns A success message with HTTP status code.
   */
  async create(emulator: EmulatorDto, userId: string): Promise<DamaruResponse> {
    const exist = await this.emulatorRepository.findOne({ where: { device_id: emulator.device_id } });
    if (exist) {
      return { message: 'Device already exist' };
    }
    const emulatorDetails = {
      ...emulator,
      state: EmulatorState.AVAILABLE,
      status: EmulatorStatus.offline
    };
    this.logAction(Actions.CREATE_EMULATOR, emulatorDetails, userId);
    await this.emulatorRepository.insert(emulatorDetails);
    return { message: 'New device has been added' };
  }

  /**
   * Updates an emulator entity with the given details.
   * @param id - Unique identifier of the emulator.
   * @param emulator - Partial DTO containing updated properties.
   * @param user - User details from token
   * @returns The result of the update operation.
   */
  async update(id: string, emulator: Partial<EmulatorDto>, user?: JwtToken) {
    if(user && user.role == Roles.AndroidUser && user.subRole === SubRoles.AndroidAdmin) {
      const userEmulators = await this.userEmulatorRepository.findOne({ where: { device: { device_id: id }, user: { id: user.sub}, unlinked_at: IsNull() } });
      if(!userEmulators) {
        throw new UnauthorizedException('You are not authorized to update this emulator')
      }
    }
    const updated = await this.emulatorRepository.update(id, emulator)
    if(updated.affected > 0) {
      return { data: 'Emulator has been updated'};
    } else {
      return { data: 'Emulator has not been updated'};
    }
  }

  /**
   * Fetches a list of emulators based on the user's role and access permissions.
   * @param jwt - The JWT token containing the user's roles and permissions.
   * @returns A list of emulators with their details appropriately mapped.
   */
  async findAll(jwt: JwtToken): Promise<DamaruResponse> {
    let emulators: Array<Emulator>;

    if (jwt.role === Roles.SuperAdmin.toString()) {
      emulators = await this.emulatorRepository.find({
        relations: { userEmulators: { user: true } }
      });
    } else if (jwt.role === Roles.AndroidUser && jwt.subRole === SubRoles.AndroidAdmin) {
      emulators = await this.emulatorRepository.find({
        where: { userEmulators: { user: { id: jwt.sub }, unlinked_at: IsNull() }, state: EmulatorState.REGISTERED },
        relations: { userEmulators: { user: true } }
      });
    } else {
      emulators = await this.emulatorRepository.find({
        where: {
          userEmulators: {
            user: { id: jwt.sub },
            unlinked_at: IsNull(),
            accountEmulator: { account: { id: jwt.accountId } }
          }
        },
        relations: { userEmulators: { user: true } }
      });
    }

    return { data: this.emulatorResponseMapper(emulators) };
  }

  /**
   * Finds an emulator by its unique device ID.
   * @param id - The device ID of the emulator.
   * @returns The emulator entity or null if not found.
   */
  findOne(id: string): Promise<Emulator | null> {
    return this.emulatorRepository.findOneBy({ device_id: id });
  }

  /**
   * Deletes an emulator entity by its unique ID.
   * @param id - The ID of the emulator to delete.
   * @returns DamaruResponse
   */
  async remove(id: string): Promise<DamaruResponse> {
    await this.emulatorRepository.delete(id);
    return { message: 'Emulator has been deleted' };
  }

  /**
   * Assigns an emulators to specific account for a user.
   * @param emulatorAssignedDto - DTO containing the emulator assignment details.
   * @param user - The JWT token of the user performing the assignment.
   * @returns void
   */
  async assignEmulatorsToAccount(emulatorAssignedDto: MultiDevicesAccountLinkDto, user: JwtToken) {
    if (this.checkSuperAdminOrSelf(emulatorAssignedDto.userId, user)) {
      for (const deviceId of emulatorAssignedDto.deviceIds) {
        const userEmulator = await this.userEmulatorRepository.findOne({
          where: { device: { device_id: deviceId }, user: { id: emulatorAssignedDto.userId } },
          select: { id: true }
        } as FindOneOptions<UserEmulators>);
        if (userEmulator) {
          try {
            await this.accountEmulatorRepository.upsert(
              {
                userEmulator: { id: userEmulator.id },
                status: AccountStatus.ACTIVE,
                account: { id: emulatorAssignedDto.accountId }
              },
              ['account.id', 'userEmulator.id']
            );
          } catch (e) {
            console.log(`Cannot assign Account:${emulatorAssignedDto.accountId}-UserEmulator:${userEmulator.id}`);
          }
        }
      }
    }
  }

  /**
   * Unassigns an emulators to specific account for a user.
   * @param emulatorAssignedDto - DTO containing the emulator assignment details.
   * @param user - The JWT token of the user performing the assignment.
   * @returns void
   */
  async unassignEmulatorsToAccount(emulatorAssignedDto: MultiDevicesAccountLinkDto, user: JwtToken) {
    if (this.checkSuperAdminOrSelf(emulatorAssignedDto.userId, user)) {
      for (const deviceId of emulatorAssignedDto.deviceIds) {
        const userEmulator = await this.userEmulatorRepository.findOne({
          where: { device: { device_id: deviceId }, user: { id: emulatorAssignedDto.userId } },
          select: { id: true }
        } as FindOneOptions<UserEmulators>);
        if (userEmulator) {
          try {
            await this.accountEmulatorRepository.delete({
              userEmulator: { id: userEmulator.id },
              account: { id: emulatorAssignedDto.accountId }
            });
          } catch (e) {
            console.log(`Cannot delete Account:${emulatorAssignedDto.accountId}-UserEmulator:${userEmulator.id}`);
          }
        }
      }
    }
  }

  /**
   * Unassigns an emulator to specific accounts for a user.
   * @param emulatorAssignedDto - DTO containing the emulator assignment details.
   * @returns void
   */
  async unassignEmulatorFromAccounts(emulatorAssignedDto: MultiAccountsLinkDto) {
    const userEmulator = await this.userEmulatorRepository.findOne({
      where: { device: { device_id: emulatorAssignedDto.deviceId }, user: { id: emulatorAssignedDto.userId } },
      select: { id: true }
    });
    if (userEmulator) {
      for (const account of emulatorAssignedDto.accountIds) {
        try {
          await this.accountEmulatorRepository.delete({
            userEmulator: { id: userEmulator.id },
            status: AccountStatus.ACTIVE,
            account: { id: account }
          });
        } catch (e) {
          console.log(`Cannot delete Account:${account}-UserEmulator:${userEmulator.id}`);
        }
      }
    }
  }

  /**
   * Assigns an emulator to specific accounts for a user.
   * @param emulatorAssignedDto - DTO containing the emulator assignment details.
   * @param user - The JWT token of the user performing the assignment.
   * @returns void
   */
  async assignEmulator(emulatorAssignedDto: MultiAccountsLinkDto, user: JwtToken) {
    if (this.checkSuperAdminOrSelf(emulatorAssignedDto.userId, user)) {
      const userEmulator = await this.userEmulatorRepository.findOne({
        where: { device: { device_id: emulatorAssignedDto.deviceId }, user: { id: emulatorAssignedDto.userId } },
        select: { id: true }
      });
      if (userEmulator) {
        for (const account of emulatorAssignedDto.accountIds) {
          try {
            await this.accountEmulatorRepository.upsert(
              {
                userEmulator: { id: userEmulator.id },
                status: AccountStatus.ACTIVE,
                account: { id: account }
              },
              ['account.id', 'userEmulator.id']
            );
          } catch (e) {
            console.log(`Cannot assign emulator, account:${account} userEmulator: ${userEmulator.id}`);
          }
        }
      }
    }
  }

  /**
   * Finds emulator by device id stage
   * @param deviceId
   * @param state
   * @private
   */
  private async findEmulatorByDeviceId(deviceId: string, state: EmulatorState) {
    return this.emulatorRepository.findOne({
      where: { device_id: deviceId, state }
    });
  }

  async extend(emulatorExtendExpiry: ExtendExpiryDto) {
    const exist = await this.userEmulatorRepository.findOne({
      where: {
        device: { device_id: emulatorExtendExpiry.deviceId },
        user: { id: emulatorExtendExpiry.userId }
      }
    });
    if (exist) {
      await this.userEmulatorRepository.update(exist.id, {
        expires_at: DateUtils.add(emulatorExtendExpiry.days, 'days', exist.expires_at)
      });
    }
  }

  connectedTemplate(accountName: string, deviceName: string, connectedDate: Date, disConnectedDate?: Date): Array<object> {
    const template = [];
    template.push({
      description: `<b>${accountName}</b> connected to <b>${deviceName}</b>`,
      date: connectedDate
    });
    if (disConnectedDate) {
      template.push({
        description: `<b>${accountName}</b> disconnected to <b>${deviceName}</b>(${DateUtils.diffInDays(disConnectedDate, connectedDate, 's')}s)`,
        date: disConnectedDate,
      });
    }
    return template;
  }

  async connectionLog(accountId: string, deviceId: string): Promise<DamaruResponse> {
    const emulatorConnections = await this.emulatorConnectionsRepository.find({
      where: {
        accountEmulators: {
          account: { id: accountId },
          userEmulator: { device: { device_id: deviceId } }
        }
      },
      relations: { accountEmulators: { userEmulator: { device: true } } }
    });
    const data: Array<object> = [];
    emulatorConnections.map((emulatorConnection) => {
      const templates = this.connectedTemplate(
        emulatorConnection.accountEmulators.account.account_name,
        emulatorConnection.accountEmulators.userEmulator.device.device_name,
        emulatorConnection.connected_at,
        emulatorConnection.disconnected_at
      );
      data.push(...templates);
    });
    return { data };
  }

  async unlinkEmulator(emulatorLinkDto: MultiDevicesLinkDto) {
    for (const device_id of emulatorLinkDto.deviceIds) {
      const linkedEmulator = await this.userEmulatorRepository.findOne({
        where: {
          user: { id: emulatorLinkDto.userId },
          device: { device_id },
          unlinked_at: IsNull()
        }
      });
      if (linkedEmulator) {
        await this.userEmulatorRepository.update(linkedEmulator.id, {
          unlinked_at: DateUtils.today()
        });
        await this.accountEmulatorRepository.delete({ userEmulator: { id: linkedEmulator.id } });
        await this.emulatorRepository.update(device_id, { state: EmulatorState.AVAILABLE });
      }
    }
  }

  /**
   * Links an emulator to a user, marking it as registered and associating it with an account.
   * @param emulatorLinkDto - DTO containing emulator linking details.
   * @returns The ID of the newly linked emulator.
   * @throws HttpException if the device is already linked.
   */
  async linkEmulator(emulatorLinkDto: MultiDevicesLinkDto) {
    for (const device_id of emulatorLinkDto.deviceIds) {
      const alreadyLinked = await this.findEmulatorByDeviceId(device_id, EmulatorState.REGISTERED);
      if (!alreadyLinked) {
        const newLink = await this.userEmulatorRepository.insert({
          user: { id: emulatorLinkDto.userId },
          device: { device_id: device_id },
          expires_at: DateUtils.add(this.configService.get('DEFAULT_DAYS') || 30, 'd'),
          linked_at: DateUtils.today(),
          unlinked_at: null
        });
        const adminAccount = await this.accountService.findRootAccount(emulatorLinkDto.userId);
        await this.accountEmulatorRepository.insert({
          userEmulator: newLink.identifiers[0]?.id,
          status: AccountStatus.ACTIVE,
          account: { id: adminAccount.id }
        });
        await this.emulatorRepository.update(device_id, { state: EmulatorState.REGISTERED });
      } else {
        throw new HttpException('This device has already been linked', HttpStatus.NOT_ACCEPTABLE);
      }
    }
  }

  /**
   * Checks if a user has the required permissions (SuperAdmin or self-assignment).
   * @param userId - The ID of the user being checked.
   * @param user - The JWT token of the currently authenticated user.
   * @returns True if the user has permissions; otherwise false.
   */
  private checkSuperAdminOrSelf(userId: string, user: JwtToken): boolean {
    return user.role === Roles.SuperAdmin || userId === user.sub;
  }

  /**
   * Logs an action with relevant metadata.
   * @param action - The action being performed.
   * @param metadata - Additional data about the action.
   * @param userId - Optional ID of the user performing the action.
   * @returns A promise that resolves after logging the action.
   */
  private logAction(action: Actions, metadata: object, userId?: string) {
    console.log({ action, metadata, user_id: userId });
  }

  /**
   * Maps a list of emulators to their appropriate response structure.
   * @param emulators - The list of emulators to map.
   * @returns A list of mapped emulators.
   */
  private emulatorResponseMapper(emulators: Array<Emulator>) {
    return emulators
      .map((emulator) => {
        emulator.screenshot = emulator.screenshot ?? Utils.getDefaultScreenShot(this.configService.get('SCREENSHOT_URL'));
        return emulator.state === EmulatorState.AVAILABLE ? this.mapAvailableEmulators(emulator) : this.mapRegisteredEmulators(emulator);
      })
      .filter((emulator) => emulator);
  }

  /**
   * Maps available emulators for response.
   * @param emulator - The emulator to map.
   * @returns The mapped emulator without sensitive details.
   */
  private mapAvailableEmulators(emulator: Emulator) {
    delete emulator.userEmulators;
    return emulator;
  }

  /**
   * Maps registered emulators for response, including user-specific details.
   * @param emulator - The emulator to map.
   * @returns The mapped emulator with additional user data.
   */
  private mapRegisteredEmulators(emulator: Emulator) {
    if (emulator.userEmulators.length > 0) {
      emulator.userEmulators
        .filter((emulatorUser) => emulatorUser.unlinked_at == null)
        .map((emulatorUser) => {
          const expiresAt = emulatorUser.expires_at;
          emulator['email'] = emulatorUser.user.email;
          emulator['userId'] = emulatorUser.user.id;
          emulator['expires_at'] = DateUtils.diffInDays(expiresAt, DateUtils.today());
          return emulator;
        });
      delete emulator.userEmulators;
    }
    return emulator;
  }

  /**
   * Links a screenshot to an emulator by its device ID.
   * @param deviceId - The unique ID of the emulator.
   * @returns The updated emulator entity.
   * @throws NotFoundException if the emulator is not found.
   */
  async linkScreenshot(deviceId: string) {
    const savedFileName = `${deviceId}.png`;
    const emulator = await this.emulatorRepository.findOne({ where: { device_id: deviceId } } as FindOneOptions<Emulator>);
    if (emulator) {
      emulator.screenshot = Utils.getDefaultScreenShot(this.configService.get('SCREENSHOT_URL'), savedFileName);
      await this.emulatorRepository.save(emulator);
      return emulator;
    } else {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }
  }

  async findLinkedDevices(deviceId: string): Promise<DamaruResponse> {
    const accountEmulators = await this.accountEmulatorRepository.find({
      where: { userEmulator: { device: { device_id: deviceId }, unlinked_at: IsNull() } },
      select: { account: { account_name: true, id: true, is_admin: true, pin: true } },
      relations: { account: true }
    });
    return {
      data: accountEmulators
        .filter((accountEmulator) => !accountEmulator.account.is_admin)
        .map((accountEmulator) => {
          return {
            id: accountEmulator.account.id,
            account_name: accountEmulator.account.account_name,
            pin: accountEmulator.account.pin
          };
        })
    };
  }

  async connectEmulator(clientId: string, deviceId: string) {
    const accountEmulatorId = await this.accountEmulatorRepository.findOne({
      where: {
        userEmulator: { device: { device_id: deviceId } },
        account: { id: clientId }
      },
      select: { id: true }
    });
    await this.emulatorConnectionsRepository.insert({
      accountEmulators: { id: accountEmulatorId.id },
      disconnected_at: null
    });
  }

  async disconnectEmulator(clientId: string) {
    const emulator = await this.emulatorRepository.findOne({ where: { device_id: clientId } });
    if (emulator) {
      await this.emulatorRepository.update(clientId, { status: EmulatorStatus.offline });
    } else {
      const emulatorConnection = await this.emulatorConnectionsRepository.findOne({
        where: {
          accountEmulators: { account: { id: clientId } },
          disconnected_at: IsNull()
        }
      });
      if (emulatorConnection) {
        await this.emulatorConnectionsRepository.update(emulatorConnection.id, { disconnected_at: DateUtils.today() });
      }
    }
  }
}
