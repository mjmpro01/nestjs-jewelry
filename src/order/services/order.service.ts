import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

import { ProductRepository } from '../../product/repositories/product.repository';
import { ProductService } from '../../product/services/product.service';  
import { Action } from '../../shared/acl/action.constant';
import { Actor } from '../../shared/acl/actor.constant';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { UserService } from '../../user/services/user.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderAclService } from './order-acl.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private productService: ProductService,
    private readonly ProductRepository: ProductRepository,
    private aclService: OrderAclService,
    private userService: UserService,
  ) {}
  generateOrderCode(): string {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${randomPart}`;
  }
  async create(
    createOrderDto: CreateOrderDto,
    ctx: RequestContext,
  ): Promise<Order> {
    const actor: Actor = ctx.user!;
    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Create, Order);

    if (!isAllowed) {
      throw new UnauthorizedException();
    }
    const order = this.orderRepository.create(createOrderDto);
    order.orderItems = [];
    order.userId = actor.id;
    let totalAmount = 0;
    const orderCode = this.generateOrderCode();
    order.orderCode = orderCode;
    for (const item of createOrderDto.orderItems) {
      const product = await this.productService.getProductById(
        ctx,
        item.productId,
      );
      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
        price: product.price,
      });
      order.orderItems.push(orderItem);
      totalAmount += product.price * item.quantity;
      // Cập nhật số lượng tồn kho của sản phẩm
      await this.ProductRepository.decrement(
        { id: product.id },
        'stockQuantity',
        item.quantity,
      );
      await this.ProductRepository.increment(
        { id: product.id },
        'totalPurchases',
        1,
      );
    }

    order.totalAmount = totalAmount;
    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['orderItems', 'orderItems.product', 'user'],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'user'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(
    ctx: RequestContext,
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const actor: Actor = ctx.user!;
    console.log(actor);
    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Update, Order);

    if (!isAllowed) {
      throw new UnauthorizedException();
    }
    const order = await this.findOne(id);
    if (updateOrderDto.userId) {
      const user = await this.userService.findById(ctx, updateOrderDto.userId);
      if (!user) {
        throw new NotFoundException(
          `Người dùng với ID ${updateOrderDto.userId} không tìm thấy`,
        );
      }
      order.user = user as unknown as User;
    }
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(ctx: RequestContext, id: number): Promise<void> {
    const actor: Actor = ctx.user!;
    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Update, Order);

    if (!isAllowed) {
      throw new UnauthorizedException();
    }
    await this.orderItemRepository.delete({ order: { id: id } });
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  async getOrdersByUser(ctx: RequestContext): Promise<Order[]> {
    const actor: Actor = ctx.user!;
    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Read, Order);

    if (!isAllowed) {
      throw new UnauthorizedException();
    }
    return this.orderRepository.find({
      where: { user: { id: actor.id } },
      relations: ['orderItems', 'orderItems.product', 'user'],
    });
  }
}
