import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../modules/users/entities/role.entity';
import { Roles } from '../../modules/users/enums/roles';
import { Encryption } from '../../modules/app/entities/encryption';

@Injectable()
export class CoreDataSeederService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Encryption)
    private readonly encryptionEntityRepository: Repository<Encryption>
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
    const encryptionEnabled = await this.encryptionEntityRepository.findOne({ where: { id: '1' } });
    if (!encryptionEnabled) {
      await this.encryptionEntityRepository.insert({ id: '1', enabled: true });
    }
  }
}
