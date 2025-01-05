import { Module } from '@nestjs/common';
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
