import { Injectable } from '@nestjs/common';
import { MultiRoleGuard } from './multi_role_authorization.guard';
import { Roles, SubRoles } from '../../modules/users/enums/roles';

@Injectable()
export class EmulatorUsers extends MultiRoleGuard {
  constructor() {
    super([
      {
        role: Roles.AndroidUser.toString(),
        subRole: SubRoles.AndroidAdmin.toString()
      },
      {
        role: Roles.AndroidUser.toString(),
        subRole: SubRoles.AndroidAccount.toString()
      },
      { role: Roles.EmulatorAdmin }
    ]);
  }
}
