import { Emulator } from '../entities/emulator.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { EmulatorDto } from '../dtos/emulator.dto';
import { EmulatorStatus } from '../interfaces/emulator.status';
import { UserEmulators } from '../entities/user-emulators';
import { DateUtils } from '../../../common/utils/date.utils';
import { UserEmulatorConnections } from '../entities/user-emulator-connections';
import { EmulatorLinkDto } from '../dtos/emulator-link.dto';
import { ActivityLogService } from '../../activity_logs/services/activity_log.service';
import { Actions } from '../../activity_logs/enums/Actions';
import { JwtToken } from '../../auth/interfaces/jwt_token';
import { Roles } from '../../users/enums/roles';

@Injectable()
export class EmulatorService {
  constructor(
    @InjectRepository(Emulator)
    private readonly emulatorRepository: Repository<Emulator>,
    @InjectRepository(UserEmulators)
    private readonly userEmulatorRepository: Repository<UserEmulators>,
    @InjectRepository(UserEmulatorConnections)
    private readonly emulatorLinkedRepository: Repository<UserEmulatorConnections>,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(emulator: EmulatorDto, userId: number) {
    const emulatorDetails = {
      ...emulator,
      status: EmulatorStatus.registered
    };
    await this.activityLogService.log({
      action: Actions.CREATE_EMULATOR,
      metadata: emulatorDetails,
      user_id: userId
    });
    return this.emulatorRepository.insert(emulatorDetails);
  }

  async update(id: string, emulator: Partial<EmulatorDto>, userId: number) {
    await this.activityLogService.log({
      action: Actions.UPDATE_EMULATOR,
      metadata: emulator,
      user_id: userId
    });
    return this.emulatorRepository.update(id, emulator);
  }

  findAll(jwt: JwtToken): Promise<Emulator[]> {
    if (jwt.role === Roles.SuperAdmin.toString()) {
      return this.emulatorRepository.find();
    } else {
      return this.emulatorRepository.find({ where: { emulatorConnections: { user: { id: jwt.sub } } } } as FindManyOptions<Emulator>);
    }
  }

  findOne(id: string): Promise<Emulator | null> {
    return this.emulatorRepository.findOneBy({ device_id: id });
  }

  async remove(id: number): Promise<void> {
    //todo change user after auth
    await this.activityLogService.log({
      action: Actions.DELETE_EMULATOR,
      metadata: { id }
    });
    await this.emulatorRepository.delete(id);
  }

  async linkEmulator(emulatorLinkDto: EmulatorLinkDto, userId: number) {
    const alreadyLinked = await this.userEmulatorRepository.findOne({
      where: {
        user: { id: userId },
        device: { device_id: emulatorLinkDto.device_id }
      }
    } as FindOneOptions<UserEmulators>);
    if (!alreadyLinked) {
      await this.activityLogService.log({
        action: Actions.LINK_EMULATOR,
        device_id: emulatorLinkDto.device_id,
        user_id: userId,
        metadata: emulatorLinkDto
      });
      //expiry DateUtils.add(30, 'd')
      const newLink = await this.userEmulatorRepository.insert({
        user: { id: userId },
        device: { device_id: emulatorLinkDto.device_id },
        expires_at: DateUtils.add(30, 'd'),
        linked_at: DateUtils.today()
      });
      return newLink?.identifiers[0]?.id as number;
    } else {
      console.log('Emulator already linked');
      return alreadyLinked.id;
    }
  }

  async connectEmulator(emulatorLinkedId: number, userId: number) {
    await this.emulatorLinkedRepository.update(emulatorLinkedId, {
      user: { id: userId },
      connected_at: DateUtils.today()
    });
  }

  async disconnectEmulator(emulatorLinkedId: string) {
    await this.emulatorLinkedRepository.update(emulatorLinkedId, { disconnected_at: DateUtils.today() });
  }

  async checkAvailability(deviceId: string) {
    const availableCheck = await this.emulatorRepository.findOne({
      where: { device_id: deviceId },
      select: { status: true }
    });
    return { available: availableCheck.status === EmulatorStatus.online };
  }
}
