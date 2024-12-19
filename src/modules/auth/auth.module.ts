import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './services/local-strategy.service';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { JwtStrategy } from './services/jwt-strategy.service';
import { WSJwtStrategy } from './services/wsjwt-strategy.service';
import { Account } from "../accounts/entities/account.entity";

@Module({
  imports: [
    PassportModule,
    /**
     * Registers the JwtModule asynchronously using ConfigService for configuration.
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET'),
        signOptions: { expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRY') }
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([Users, Account])
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, WSJwtStrategy],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
