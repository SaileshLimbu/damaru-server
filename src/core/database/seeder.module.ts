import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreDataSeederService } from './coredataseeder.service';
import { Role } from '../../modules/users/entities/role.entity';
import { EncryptionEntity } from '../../modules/app/entities/encryption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, EncryptionEntity])],
  providers: [CoreDataSeederService],
  exports: [CoreDataSeederService]
})
export class SeederModule {}
