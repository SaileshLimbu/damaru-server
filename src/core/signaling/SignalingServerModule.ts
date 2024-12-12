import { Module } from '@nestjs/common';
import { SignalingServerGateway } from './SignalingServerGateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WsJwtGuard } from '../guards/wsjwt.guard';
import { EmulatorModule } from '../../modules/emulators/emulator.module';
import { ActivityLogModule } from '../../modules/activity_logs/activity_log.module';

@Module({
  providers: [SignalingServerGateway, WsJwtGuard],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET'),
        signOptions: { expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRY') }
      }),
      inject: [ConfigService]
    }),
    EmulatorModule, ActivityLogModule
  ]
})
export class SignalingServerModule {}
