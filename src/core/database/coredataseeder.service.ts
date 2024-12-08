import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../modules/users/entities/role.entity';
import { Roles } from '../../modules/users/enums/roles';

@Injectable()
export class CoreDataSeederService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
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
}
