import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './services/user.service';
import { UsersController } from './controllers/user.controller';
import { AccountsModule } from '../accounts/account.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AccountsModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
