import { Injectable } from '@nestjs/common';

import { ROLE } from '../../auth/constants/role.constant';
import { BaseAclService } from '../../shared/acl/acl.service';
import { Action } from '../../shared/acl/action.constant';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductAclService extends BaseAclService<Product> {
  constructor() {
    super();
    this.canDo(ROLE.ADMIN, [Action.Manage]);
    this.canDo(ROLE.USER, [Action.Read, Action.List]);
  }
}
