import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Apk } from '../entities/Apk';
import { ConfigService } from '@nestjs/config';
import { ApkDto } from '../../app/dtos/ApkDto';

@Injectable()
export class ApkService {
  constructor(
    @InjectRepository(Apk)
    private readonly apkRepository: Repository<Apk>,
    private readonly configService: ConfigService
  ) {}

  getApkPath(): string {
    return `${this.configService.get<string>('APK_PATH')}`;
  }

  getApkDownloadLink(): string {
    return `${this.configService.get<string>('SCREENSHOT_URL')}/apks/download`;
  }

  async getLatestApkPath(): Promise<Apk> {
    const version = await this.apkRepository.find({
      order: { version: 'DESC' },
      take: 1
    });
    if (version.length > 0) {
      version[0].link = `${this.getApkPath()}/${version[0].link}`;
      return version[0];
    } else {
      throw new BadRequestException('No APK found!');
    }
  }

  async uploadApk(apkDto: ApkDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded!');
    }
    const fileName = 'damaru.apk';
    // delete all versions
    await this.apkRepository.delete({});
    await this.apkRepository.insert({
      version: parseInt(apkDto.version.toString()),
      force: apkDto.force.toString() === 'true',
      link: fileName
    });
    return {
      message: 'APK uploaded successfully'
    };
  }
}
