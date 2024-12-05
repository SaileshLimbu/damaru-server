import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { AccountsService } from './services/account.service';
import { AccountsController } from './controllers/account.controller';
import { ActivityLogModule } from '../activity_logs/activity_log.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), ActivityLogModule, AuthModule],
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService]
})
export class AccountsModule {}
