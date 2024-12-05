import { Injectable } from '@nestjs/common';
import { BaseAuthorizationGuard } from './base_authorization.guard';
import { Roles, SubRoles } from '../../modules/users/enums/roles';

@Injectable()
export class AndroidAdmin extends BaseAuthorizationGuard {
  constructor() {
    super(Roles.AndroidUser.toString(), SubRoles.AndroidAdmin.toString());
  }
}
