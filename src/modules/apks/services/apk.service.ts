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

  private getFilePath(filename: string): string {
    return `${this.getApkPath()}/${filename}`;
  }

  async uploadApk(apkDto: ApkDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded!');
    }
    const newFilename = `damaru-${apkDto.version}.apk`;
    const tempFileName = 'damaru.apk';
    console.log({apkDto})
    fs.renameSync(this.getFilePath(tempFileName), this.getFilePath(newFilename));
    await this.apkRepository.upsert({ version: parseInt(apkDto.version.toString()), force: apkDto.force.toString() === 'true', link: newFilename }, ['version']);
    return {
      message: 'APK uploaded successfully'
    };
  }
}
