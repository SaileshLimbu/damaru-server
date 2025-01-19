import { BadRequestException, Module } from '@nestjs/common';
import { registerConfigModule, registerDatabaseModule, registerStatic } from './modules.registry';
import { AppController } from './modules/app/app.controller';
import { AppService } from './modules/app/app.service';
import { UsersModule } from './modules/users/user.module';
import { AccountsModule } from './modules/accounts/account.module';
import { EmulatorModule } from './modules/emulators/emulator.module';
import { ActivityLogModule } from './modules/activity_logs/activity_log.module';
import { AuthModule } from './modules/auth/auth.module';
import { EncryptionService } from './core/encryption/encryption.service';
import { SeederModule } from './core/database/seeder.module';
import { SignalingServerModule } from './core/signaling/SignalingServerModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encryption } from './modules/app/entities/encryption';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './core/middlewares/ResponseInterceptor';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';

@Module({
  imports: [
    registerConfigModule(),
    registerDatabaseModule(),
    registerStatic(),
    AuthModule,
    UsersModule,
    AccountsModule,
    EmulatorModule,
    ActivityLogModule,
    SeederModule,
    SignalingServerModule,
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
    TypeOrmModule.forFeature([Encryption])
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EncryptionService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    }
  ]
})
export class AppModule {}
