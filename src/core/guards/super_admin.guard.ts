import { Injectable } from '@nestjs/common';
import { BaseAuthorizationGuard } from './base_authorization.guard';
import { Roles } from '../../modules/users/enums/roles';

@Injectable()
export class SuperAdmin extends BaseAuthorizationGuard {
  constructor() {
    super(Roles.SuperAdmin.toString());
  }
}
