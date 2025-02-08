import { ConfigModule, ConfigService } from '@nestjs/config';
import { Users } from "./modules/users/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./modules/accounts/entities/account.entity";
import { UserEmulators } from "./modules/emulators/entities/user-emulators";
import { Emulator } from "./modules/emulators/entities/emulator.entity";
import { EmulatorConnections } from "./modules/emulators/entities/emulator-connections";
import { ActivityLog } from "./modules/activity_logs/entities/activity_log.entity";
import { Role } from "./modules/users/entities/role.entity";
import { Encryption } from './modules/app/entities/encryption';
import { ServeStaticModule, ServeStaticModuleOptions } from '@nestjs/serve-static';
import { resolve } from 'path';
import { AccountEmulators } from './modules/emulators/entities/account-emulators';
import { Apk } from './modules/apks/entities/Apk';
import { Environments } from './common/interfaces/environments';


/**
 * Registers a global configuration module to load environment variables.
 * @returns A configured ConfigModule instance.
 */
export const registerConfigModule = () =>
  ConfigModule.forRoot({
    isGlobal: true
  });

export const registerDatabaseModule = () =>
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get<number>('DB_PORT', 5432),
      username: configService.get<string>('DB_USER'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
      logging: configService.get<string>('ENVIRONMENT') === Environments.DEVELOPMENT,
      entities: [
        Users, Account, UserEmulators, Emulator, EmulatorConnections,
        ActivityLog, Role, Encryption, AccountEmulators, Apk
      ],
      synchronize: configService.get<string>('ENVIRONMENT') === Environments.DEVELOPMENT,
    }),
  });

export const registerStatic = () =>
  ServeStaticModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<ServeStaticModuleOptions[]> => [
      {
        rootPath: resolve(configService.get<string>('SCREENSHOT_PATH') || 'screenshots'),
        serveStaticOptions: { index: false },
      },
    ],
  })
