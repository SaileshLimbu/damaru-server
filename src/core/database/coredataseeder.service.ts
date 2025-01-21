import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../modules/users/entities/role.entity';
import { Roles } from '../../modules/users/enums/roles';
import { Encryption } from '../../modules/app/entities/encryption';
import { ConfigService } from '@nestjs/config';
import { Users } from '../../modules/users/entities/user.entity';

@Injectable()
export class CoreDataSeederService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Encryption)
    private readonly encryptionEntityRepository: Repository<Encryption>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly configService: ConfigService
  ) {}

  async seedEmulatorUser() {
    const emulatorUser = await this.usersRepository.findOne({where: { email: this.configService.get('EMULATOR_USER_EMAIL')}})
    if(!emulatorUser) {
      const emulatorUser = this.usersRepository.create({
        name: this.configService.get('EMULATOR_USER_NAME'),
        email: this.configService.get('EMULATOR_USER_EMAIL'),
        password: this.configService.get('EMULATOR_USER_PASSWORD'),
        role: { name: Roles.EmulatorAdmin } as Role
      });
      await this.usersRepository.save(emulatorUser);
    }
    console.log('SuperAdmin added successfully');
  }
  async seedSuperAdmin(){
    const superAdmin = await this.usersRepository.findOne({where: { email: this.configService.get('SUPER_ADMIN_EMAIL')}})
    if(!superAdmin) {
      const superAdmin = this.usersRepository.create({
        name: this.configService.get('SUPER_ADMIN_NAME'),
        email: this.configService.get('SUPER_ADMIN_EMAIL'),
        password: this.configService.get('SUPER_ADMIN_PASSWORD'),
        role: { name: Roles.SuperAdmin } as Role
      });
      await this.usersRepository.save(superAdmin);
    }
    console.log('SuperAdmin added successfully');
    await this.seedEmulatorUser();
  }
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
    await this.seedSuperAdmin();
  }

  async seedEncryption() {
    const encryptionEnabled = await this.encryptionEntityRepository.findOne({ where: { id: '1' } });
    if (!encryptionEnabled) {
      await this.encryptionEntityRepository.insert({ id: '1', enabled: true });
    }
  }
}
