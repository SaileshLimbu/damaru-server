import { Module } from '@nestjs/common';
import {
  registerConfigModule,
  registerDatabaseModule,
} from './modules.registry';
import { AppController } from './modules/app/app.controller';
import { AppService } from './modules/app/app.service';
import { UsersModule } from './modules/users/user.module';
import { AccountsModule } from './modules/accounts/account.module';
import { EmulatorModule } from './modules/emulators/emulator.module';

@Module({
  imports: [
    registerConfigModule(),
    registerDatabaseModule(),
    UsersModule,
    AccountsModule,
    EmulatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
