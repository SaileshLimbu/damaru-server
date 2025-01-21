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


/**
 * Registers a global configuration module to load environment variables.
 * @returns A configured ConfigModule instance.
 */
export const registerConfigModule = () =>
  ConfigModule.forRoot({
    isGlobal: true
  });

export const registerDatabaseModule = () =>
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
      Users, Account, UserEmulators, Emulator, EmulatorConnections,
      ActivityLog, Role, Encryption, AccountEmulators
    ],
    synchronize: true
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
