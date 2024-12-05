import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './services/user.service';
import { UsersController } from './controllers/user.controller';
import { AccountsModule } from '../accounts/account.module';
import { ActivityLogModule } from '../activity_logs/activity_log.module';
import { Role } from './entities/role.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), AccountsModule, ActivityLogModule, AuthModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
