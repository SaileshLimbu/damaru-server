import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  checkHealth(): string {
    return '{"message" : "OK"}';
  }

  getApkPath(): string {
    return `${this.configService.get<string>('APK_PATH')}/damaru.apk`;
  }
}
