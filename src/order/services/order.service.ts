import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductRepository } from '../../product/repositories/product.repository';
import { ProductService } from '../../product/services/product.service';
import { Action } from '../../shared/acl/action.constant';
import { Actor } from '../../shared/acl/actor.constant';
import { RequestContext } from '../../shared/request-context/request-context.dto';
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
    
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    ctx: RequestContext,
  ): Promise<Order> {
    const actor: Actor = ctx.user!;
    console.log(actor);
    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Create, Order)

    if (!isAllowed) {
      throw new UnauthorizedException();
    }
    const order = this.orderRepository.create(createOrderDto);
    order.orderItems = [];
    order.userId = actor.id;
    let totalAmount = 0;

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

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}
