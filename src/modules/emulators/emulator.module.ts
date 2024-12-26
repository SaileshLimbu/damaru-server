import { TypeOrmModule } from '@nestjs/typeorm';
import { BadRequestException, Module } from '@nestjs/common';
import { Emulator } from './entities/emulator.entity';
import { EmulatorService } from './services/emulator.service';
import { EmulatorController } from './controllers/emulator.controller';
import { UserEmulators } from './entities/user-emulators';
import { UserEmulatorConnections } from './entities/user-emulator-connections';
import { ActivityLogModule } from '../activity_logs/activity_log.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Emulator, UserEmulators, UserEmulatorConnections]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('SCREENSHOT_PATH') || '../screenshots',
          filename: (req, file, callback) => {
            callback(null, file.originalname);
          },
        }),
        fileFilter: (req, file, callback) => {
          const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(new BadRequestException('Only image files are allowed!'), false);
          }
          callback(null, true);
        },
      }),
      inject: [ConfigService],
    }),
    ActivityLogModule
  ],
  providers: [EmulatorService],
  controllers: [EmulatorController],
  exports: [EmulatorService]
})
export class EmulatorModule {}
