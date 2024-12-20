import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../modules/users/entities/role.entity';
import { Roles } from '../../modules/users/enums/roles';
import { EncryptionEntity } from '../../modules/app/entities/encryption.entity';

@Injectable()
export class CoreDataSeederService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(EncryptionEntity)
    private readonly encryptionEntityRepository: Repository<EncryptionEntity>
  ) {}

  async seedRoles() {
    const roles = Object.values(Roles);

    for (const roleName of roles) {
      const existingRole = await this.roleRepository.findOne({ where: { name: roleName } });
      if (!existingRole) {
        const role = this.roleRepository.create({ name: roleName });
        await this.roleRepository.save(role);
      }
    }

    console.log('Roles seeded successfully');
  }

  async seedEncryption() {
    const encryptionEnabled = await this.encryptionEntityRepository.findOne({ where: { id: 1 } });
    if (!encryptionEnabled) {
      await this.encryptionEntityRepository.insert({ enabled: true });
    }
  }
}
