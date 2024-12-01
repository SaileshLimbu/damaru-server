import { ConfigModule } from '@nestjs/config';
import { User } from './modules/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './modules/accounts/entities/account.entity';
import { EmulatorCode } from './modules/emulators/entities/emulator-code.entity';
import { Emulator } from './modules/emulators/entities/emulator.entity';
import { EmulatorLinked } from './modules/emulators/entities/emulator-linked.entity';

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
    entities: [User, Account, EmulatorCode, Emulator, EmulatorLinked],
    synchronize: true
  });
