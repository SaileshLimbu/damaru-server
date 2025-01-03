import { Emulator } from '../entities/emulator.entity';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { EmulatorDto } from '../dtos/emulator.dto';
import { EmulatorStatus } from '../interfaces/emulator.status';
import { UserEmulators } from '../entities/user-emulators';
import { DateUtils } from '../../../common/utils/date.utils';
import { EmulatorLinkDto } from '../dtos/emulator-link.dto';
import { ActivityLogService } from '../../activity_logs/services/activity_log.service';
import { Actions } from '../../activity_logs/enums/Actions';
import { JwtToken } from '../../auth/interfaces/jwt_token';
import { Roles, SubRoles } from '../../users/enums/roles';
import { ConfigService } from '@nestjs/config';
import { EmulatorState } from '../interfaces/emulator.state';
import { EmulatorAssignDto } from '../dtos/emulator-assign.dto';
import { AccountEmulators } from '../entities/account-emulators';
import { AccountStatus } from '../interfaces/account.status';
import { AccountsService } from '../../accounts/services/account.service';
import { AccountEmulatorsAssignDto } from '../dtos/account-emulators-assign.dto';

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
    private readonly activityLogService: ActivityLogService,
    private readonly configService: ConfigService,
    private readonly accountService: AccountsService
  ) {}

  /**
   * Creates a new emulator entity and logs its creation in the activity logs.
   * @param emulator - DTO containing details of the emulator to be created.
   * @param userId - ID of the user performing the creation.
   * @returns A success message with HTTP status code.
   */
  async create(emulator: EmulatorDto, userId: number) {
    const emulatorDetails = {
      ...emulator,
      state: EmulatorState.AVAILABLE,
      status: EmulatorStatus.offline
    };
    await this.logAction(Actions.CREATE_EMULATOR, emulatorDetails, userId);
    await this.emulatorRepository.insert(emulatorDetails);
    return { status: HttpStatus.OK, message: 'New device has been added' };
  }

  /**
   * Updates an emulator entity with the given details.
   * @param id - Unique identifier of the emulator.
   * @param emulator - Partial DTO containing updated properties.
   * @returns The result of the update operation.
   */
  async update(id: string, emulator: Partial<EmulatorDto>) {
    return this.emulatorRepository.update(id, emulator);
  }

  /**
   * Fetches a list of emulators based on the user's role and access permissions.
   * @param jwt - The JWT token containing the user's roles and permissions.
   * @returns A list of emulators with their details appropriately mapped.
   */
  async findAll(jwt: JwtToken) {
    let emulators: Array<Emulator>;

    if (jwt.role === Roles.SuperAdmin.toString()) {
      emulators = await this.emulatorRepository.find({
        relations: { userEmulators: { user: true } }
      });
    } else if (jwt.role === Roles.AndroidUser && jwt.subRole === SubRoles.AndroidAdmin) {
      emulators = await this.emulatorRepository.find({
        where: { userEmulators: { user: { id: jwt.sub } }, state: EmulatorState.REGISTERED },
        relations: { userEmulators: { user: true } }
      });
    } else {
      emulators = await this.emulatorRepository.find({
        where: {
          userEmulators: {
            user: { id: jwt.sub },
            accountEmulator: { account: { id: jwt.accountId } }
          }
        },
        relations: { userEmulators: { user: true } }
      });
    }

    return this.emulatorResponseMapper(emulators);
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
   * @returns void
   */
  async remove(id: number): Promise<void> {
    await this.emulatorRepository.delete(id);
  }

  /**
   * Assigns an emulators to specific account for a user.
   * @param emulatorAssignedDto - DTO containing the emulator assignment details.
   * @param user - The JWT token of the user performing the assignment.
   * @returns void
   */
  async assignEmulatorsToAccount(emulatorAssignedDto: AccountEmulatorsAssignDto, user: JwtToken) {
    if (this.checkSuperAdminOrSelf(emulatorAssignedDto.user_id, user)) {
      for (const deviceId of emulatorAssignedDto.device_ids) {
        const userEmulator = await this.userEmulatorRepository.findOne({
          where: { device: { device_id: deviceId }, user: { id: emulatorAssignedDto.user_id } },
          select: { id: true }
        } as FindOneOptions<UserEmulators>);
        await this.accountEmulatorRepository.upsert(
          {
            userEmulator: { id: userEmulator.id },
            status: AccountStatus.ACTIVE,
            account: { id: emulatorAssignedDto.accountId }
          },
          ['account.id', 'userEmulator.id']
        );
      }
    }
  }

  /**
   * Assigns an emulator to specific accounts for a user.
   * @param emulatorAssignedDto - DTO containing the emulator assignment details.
   * @param user - The JWT token of the user performing the assignment.
   * @returns void
   */
  async assignEmulator(emulatorAssignedDto: EmulatorAssignDto, user: JwtToken) {
    if (this.checkSuperAdminOrSelf(emulatorAssignedDto.user_id, user)) {
      const userEmulator = await this.userEmulatorRepository.findOne({
        where: { device: { device_id: emulatorAssignedDto.device_id }, user: { id: emulatorAssignedDto.user_id } },
        select: { id: true }
      });
      for (const account of emulatorAssignedDto.accountIds) {
        await this.accountEmulatorRepository.upsert(
          {
            userEmulator: { id: userEmulator.id },
            status: AccountStatus.ACTIVE,
            account: { id: account }
          },
          ['account.id', 'userEmulator.id']
        );
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

  /**
   * Links an emulator to a user, marking it as registered and associating it with an account.
   * @param emulatorLinkDto - DTO containing emulator linking details.
   * @returns The ID of the newly linked emulator.
   * @throws HttpException if the device is already linked.
   */
  async linkEmulator(emulatorLinkDto: EmulatorLinkDto) {
    const alreadyLinked = await this.findEmulatorByDeviceId(emulatorLinkDto.device_id, EmulatorState.REGISTERED);
    if (!alreadyLinked) {
      const newLink = await this.userEmulatorRepository.insert({
        user: { id: emulatorLinkDto.user_id },
        device: { device_id: emulatorLinkDto.device_id },
        expires_at: DateUtils.add(30, 'd'),
        linked_at: DateUtils.today(),
        unlinked_at: null
      });
      const adminAccount = await this.accountService.findRootAccount(emulatorLinkDto.user_id);
      await this.accountEmulatorRepository.insert({
        userEmulator: newLink.identifiers[0]?.id,
        status: AccountStatus.ACTIVE,
        account: { id: adminAccount.id }
      });
      await this.emulatorRepository.update(emulatorLinkDto.device_id, { state: EmulatorState.REGISTERED });
      return newLink?.identifiers[0]?.id as number;
    } else {
      throw new HttpException('This device has already been linked', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  /**
   * Checks if a user has the required permissions (SuperAdmin or self-assignment).
   * @param userId - The ID of the user being checked.
   * @param user - The JWT token of the currently authenticated user.
   * @returns True if the user has permissions; otherwise false.
   */
  private checkSuperAdminOrSelf(userId: number, user: JwtToken): boolean {
    return user.role === Roles.SuperAdmin || userId === user.sub;
  }

  /**
   * Logs an action with relevant metadata.
   * @param action - The action being performed.
   * @param metadata - Additional data about the action.
   * @param userId - Optional ID of the user performing the action.
   * @returns A promise that resolves after logging the action.
   */
  private logAction(action: Actions, metadata: object, userId?: number) {
    return this.activityLogService.log({ action, metadata, user_id: userId });
  }

  /**
   * Maps a list of emulators to their appropriate response structure.
   * @param emulators - The list of emulators to map.
   * @returns A list of mapped emulators.
   */
  private emulatorResponseMapper(emulators: Array<Emulator>) {
    return emulators
      .map((emulator) => {
        emulator.screenshot = emulator.screenshot ?? `${this.configService.get('SCREENSHOT_URL')}/default.png`;
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
      emulator.screenshot = `${this.configService.get<string>('SCREENSHOT_URL')}/${savedFileName}`;
      await this.emulatorRepository.save(emulator);
      return emulator;
    } else {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }
  }
}
