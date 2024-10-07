import { Injectable } from '@nestjs/common';

import { ROLE } from '../../auth/constants/role.constant';
import { BaseAclService } from '../../shared/acl/acl.service';
import { Action } from '../../shared/acl/action.constant';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderAclService extends BaseAclService<Order> {
  constructor() {
    super();
    this.canDo(ROLE.ADMIN, [Action.Manage]);
    this.canDo(ROLE.USER, [Action.Read, Action.List, Action.Create]);
  }
}
