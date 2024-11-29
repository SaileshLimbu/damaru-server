import { Emulator } from '../entities/emulator.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmulatorUserDto } from '../dtos/emulator.user.dto';
import { EmulatorStatus } from '../interfaces/emulator.status';
import { EmulatorCode } from '../entities/emulator-code.entity';
import { StringUtils } from '../../../common/utils/string.utils';
import { DateUtils } from '../../../common/utils/date.utils';

@Injectable()
export class EmulatorService {
  constructor(
    @InjectRepository(Emulator)
    private emulatorRepository: Repository<Emulator>,
    @InjectRepository(EmulatorCode)
    private emulatorCodesRepository: Repository<EmulatorCode>,
  ) {}

  create(emulator: EmulatorUserDto) {
    return this.emulatorRepository.insert({
      ...emulator,
      status: EmulatorStatus.registered,
    });
  }

  update(id: string, emulator: Partial<EmulatorUserDto>) {
    return this.emulatorRepository.update(id, emulator);
  }

  findAll(): Promise<Emulator[]> {
    return this.emulatorRepository.find();
  }

  findOne(id: string): Promise<Emulator | null> {
    return this.emulatorRepository.findOneBy({ device_id: id });
  }

  async remove(id: number): Promise<void> {
    await this.emulatorRepository.delete(id);
  }

  generateCode(device_id: string) {
    return this.emulatorCodesRepository.insert({
      code: StringUtils.generateRandomAlphaNumeric(5),
      device: { device_id },
      expires_at: DateUtils.add(30, 'd'),
    });
  }

  getEmulatorCodes() {
    return this.emulatorCodesRepository.find();
  }
}
