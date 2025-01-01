import { Emulator } from '../entities/emulator.entity';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, IsNull, Not, Repository } from 'typeorm';
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
import { ConfigService } from '@nestjs/config';
import { EmulatorState } from '../interfaces/emulator.state';

@Injectable()
export class EmulatorService {
  constructor(
    @InjectRepository(Emulator)
    private readonly emulatorRepository: Repository<Emulator>,
    @InjectRepository(UserEmulators)
    private readonly userEmulatorRepository: Repository<UserEmulators>,
    @InjectRepository(UserEmulatorConnections)
    private readonly emulatorLinkedRepository: Repository<UserEmulatorConnections>,
    private readonly activityLogService: ActivityLogService,
    private readonly configService: ConfigService
  ) {}

  async create(emulator: EmulatorDto, userId: number) {
    const emulatorDetails = {
      ...emulator,
      state: EmulatorState.AVAILABLE,
      status: EmulatorStatus.offline
    };
    await this.activityLogService.log({
      action: Actions.CREATE_EMULATOR,
      metadata: emulatorDetails,
      user_id: userId
    });
    return this.emulatorRepository.insert(emulatorDetails);
  }

  async update(id: string, emulator: Partial<EmulatorDto>) {
    return this.emulatorRepository.update(id, emulator);
  }

  private emulatorResponseMapper(emulators: Array<Emulator>) {
    return emulators
      .map((emulator) => {
        console.log(emulator);
        if (!emulator.screenshot) {
          emulator.screenshot = `${this.configService.get('SCREENSHOT_URL')}/default.png`;
        }
        if (emulator.state == EmulatorState.AVAILABLE) {
          delete emulator.userEmulators;
          return emulator;
        } else {
          // TODO manage in query
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
            return emulator;
          }
        }
      })
      .filter((emulator) => emulator);
  }

  async findAll(jwt: JwtToken) {
    if (jwt.role === Roles.SuperAdmin.toString()) {
      const emulators = await this.emulatorRepository.find({
        relations: { userEmulators: { user: true } }
      });
      return this.emulatorResponseMapper(emulators);
    } else {
      const emulators = await this.emulatorRepository.find({
        where: { userEmulators: { user: { id: jwt.sub }, linked_at: Not(IsNull()) } },
        relations: { userEmulators: { user: true } }
      } as FindManyOptions<Emulator>);
      return this.emulatorResponseMapper(emulators);
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

  async linkEmulator(emulatorLinkDto: EmulatorLinkDto) {
    const alreadyLinked = await this.userEmulatorRepository.findOne({
      where: {
        device: { device_id: emulatorLinkDto.device_id },
        unlinked_at: IsNull()
      }
    } as FindOneOptions<UserEmulators>);
    if (!alreadyLinked) {
      await this.activityLogService.log({
        action: Actions.LINK_EMULATOR,
        device_id: emulatorLinkDto.device_id,
        user_id: emulatorLinkDto.user_id,
        metadata: emulatorLinkDto
      });
      const newLink = await this.userEmulatorRepository.insert({
        user: { id: emulatorLinkDto.user_id },
        device: { device_id: emulatorLinkDto.device_id },
        expires_at: DateUtils.add(30, 'd'),
        linked_at: DateUtils.today(),
        unlinked_at: null
      });
      await this.emulatorRepository.update(emulatorLinkDto.device_id, { state: EmulatorState.REGISTERED });
      return newLink?.identifiers[0]?.id as number;
    } else {
      throw new HttpException('This device has already been linked', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  async connectEmulator(emulatorLinkedId: number, userId: number) {
    await this.emulatorLinkedRepository.update(emulatorLinkedId, {
      user: { id: userId },
      connected_at: DateUtils.today()
    });
  }

  async checkAvailability(deviceId: string) {
    const availableCheck = await this.emulatorRepository.findOne({
      where: { device_id: deviceId },
      select: { status: true }
    });
    return { available: availableCheck.status === EmulatorStatus.online };
  }

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
