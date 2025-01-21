import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreDataSeederService } from './coredataseeder.service';
import { Role } from '../../modules/users/entities/role.entity';
import { Encryption } from '../../modules/app/entities/encryption';
import { Users } from '../../modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Encryption, Users])],
  providers: [CoreDataSeederService],
  exports: [CoreDataSeederService]
})
export class SeederModule {}
