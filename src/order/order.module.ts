import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductModule } from '../product/product.module';
import { OrderController } from './controllers/order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './services/order.service';
import { OrderAclService } from './services/order-acl.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), ProductModule],
  controllers: [OrderController],
  providers: [OrderService, OrderAclService],
  exports: [OrderService],
})
export class OrderModule {}
