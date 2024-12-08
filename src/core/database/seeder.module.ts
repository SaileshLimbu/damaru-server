import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreDataSeederService } from './coredataseeder.service';
import { Role } from '../../modules/users/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [CoreDataSeederService],
  exports: [CoreDataSeederService]
})
export class SeederModule {}
