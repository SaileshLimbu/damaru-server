import { TypeOrmModule } from '@nestjs/typeorm';
import { BadRequestException, Module } from '@nestjs/common';
import { Apk } from './entities/Apk';
import { ApkService } from './services/apk.service';
import { ApkController } from './controllers/apk.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';

@Module({
  imports: [TypeOrmModule.forFeature([Apk]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('APK_PATH'),
          filename: (_req, _file, callback) => {
            callback(null, `damaru.apk`);
          }
        }),
        fileFilter: (_req, file, callback) => {
          const allowedMimeTypes = ['application/vnd.android.package-archive'];
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(new BadRequestException('Only apk files are allowed!'), false);
          }
          callback(null, true);
        }
      }),
      inject: [ConfigService]
    }),
  ],
  providers: [ApkService],
  controllers: [ApkController]
})
export class ApkModule {}
