import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreDataSeederService } from './coredataseeder.service';
import { Role } from '../../modules/users/entities/role.entity';
import { Encryption } from '../../modules/app/entities/encryption';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Encryption])],
  providers: [CoreDataSeederService],
  exports: [CoreDataSeederService]
})
export class SeederModule {}
