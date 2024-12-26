import { Injectable } from '@nestjs/common';
import { Roles, SubRoles } from '../../modules/users/enums/roles';
import { MultiRoleGuard } from './multi_role_authorization.guard';

@Injectable()
export class AndroidUsers extends MultiRoleGuard {
  constructor() {
    super([
      {
        role: Roles.AndroidUser.toString(),
        subRole: SubRoles.AndroidAdmin.toString()
      },
      { role: Roles.AndroidUser.toString(), subRole: SubRoles.AndroidAccount.toString() }
    ]);
  }
}
