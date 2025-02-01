import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Apk } from '../entities/Apk';
import { ConfigService } from '@nestjs/config';
import { ApkDto } from '../../app/dtos/ApkDto';
import * as fs from 'node:fs';

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
    return `${this.configService.get<string>('SCREENSHOT_URL')}/apk/download`;
  }

  async getLatestApkPath(): Promise<Apk> {
    const version = await this.apkRepository.find({
      order: { version: 'DESC' },
      select: { version: true, force: true, link: true },
      take: 1
    });
    if (version.length > 0) {
      return version[0];
    } else {
      throw new BadRequestException('No APK found!');
    }
  }

  public async getLatestApkVersion(): Promise<number> {
    const version = await this.apkRepository.find({
      order: { version: 'DESC' },
      select: { version: true },
      take: 1
    });
    return version.length > 0 ? version[0].version : 0;
  }

  async uploadApk(apkDto: ApkDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded!');
    }

    // Get latest version dynamically
    const latestVersion = await this.getLatestApkVersion();
    console.log({ latestVersion });
    const newFilename = `damaru-${latestVersion}.apk`;
    const tempFileName = 'damaru.apk';
    const filePath = `${this.getApkPath()}/${newFilename}`;
    fs.renameSync(`${this.getApkPath()}/${tempFileName}`, filePath);
    await this.apkRepository.insert({ force: apkDto.force, link: filePath });
    return {
      message: 'APK uploaded successfully'
    };
  }
}
