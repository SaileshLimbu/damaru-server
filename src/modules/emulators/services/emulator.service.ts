import { Emulator } from '../entities/emulator.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmulatorDto } from '../dtos/emulator.dto';
import { EmulatorStatus } from '../interfaces/emulator.status';
import { EmulatorCode } from '../entities/emulator-code.entity';
import { StringUtils } from '../../../common/utils/string.utils';
import { DateUtils } from '../../../common/utils/date.utils';
import { EmulatorLinked } from '../entities/emulator-linked.entity';
import { EmulatorLinkDto } from '../dtos/emulator-link.dto';
import { ActivityLogService } from '../../activity_logs/services/activity_log.service';
import { Actions } from '../../activity_logs/enums/Actions';

@Injectable()
export class EmulatorService {
  constructor(
    @InjectRepository(Emulator)
    private readonly emulatorRepository: Repository<Emulator>,
    @InjectRepository(EmulatorCode)
    private readonly emulatorCodesRepository: Repository<EmulatorCode>,
    @InjectRepository(EmulatorLinked)
    private readonly emulatorLinkedRepository: Repository<EmulatorLinked>,
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

  findAll(): Promise<Emulator[]> {
    return this.emulatorRepository.find();
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
    const alreadyLinked = await this.emulatorLinkedRepository.findOne({
      where: {
        user: { id: userId },
        device: { device_id: emulatorLinkDto.device_id }
      }
    });
    if (!alreadyLinked) {
      await this.activityLogService.log({
        action: Actions.LINK_EMULATOR,
        account_id: emulatorLinkDto.account_id,
        device_id: emulatorLinkDto.device_id,
        user_id: userId,
        metadata: emulatorLinkDto
      });
      //expiry DateUtils.add(30, 'd')
      const newLink = await this.emulatorLinkedRepository.insert({
        connected_at: emulatorLinkDto.connected_at,
        account: { id: emulatorLinkDto.account_id },
        disconnected_at: null,
        user: { id: userId },
        device: { device_id: emulatorLinkDto.device_id },
        expiry_at: emulatorLinkDto.expiry_at
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

  generateCode(device_id: string) {
    return this.emulatorCodesRepository.insert({
      code: StringUtils.generateRandomAlphaNumeric(5),
      device: { device_id },
      expires_at: DateUtils.add(30, 'd')
    });
  }

  async checkAvailability(deviceId: string) {
    const availableCheck = await this.emulatorRepository.findOne({
      where: { device_id: deviceId },
      select: { status: true }
    });
    return { available: availableCheck.status === EmulatorStatus.online };
  }

  getEmulatorCodes() {
    return this.emulatorCodesRepository.find();
  }
}
