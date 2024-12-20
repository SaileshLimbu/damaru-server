import { ConfigModule } from "@nestjs/config";
import { Users } from "./modules/users/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./modules/accounts/entities/account.entity";
import { UserEmulators } from "./modules/emulators/entities/user-emulators";
import { Emulator } from "./modules/emulators/entities/emulator.entity";
import { UserEmulatorConnections } from "./modules/emulators/entities/user-emulator-connections";
import { ActivityLog } from "./modules/activity_logs/entities/activity_log.entity";
import { Role } from "./modules/users/entities/role.entity";
import { EncryptionEntity } from './modules/app/entities/encryption.entity';

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
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [Users, Account, UserEmulators, Emulator, UserEmulatorConnections, ActivityLog, Role, EncryptionEntity],
    synchronize: true
  });
