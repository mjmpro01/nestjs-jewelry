import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { OrderService } from '../services/order.service';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @ReqContext() ctx: RequestContext,
  ) {
    return this.orderService.create(createOrderDto, ctx);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Return all orders.' })
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific order' })
  @ApiResponse({ status: 200, description: 'Return the order.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a new order' })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @ReqContext() ctx: RequestContext,
  ) {
    return this.orderService.update(ctx, +id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({
    status: 200,
    description: 'The order has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  remove(@ReqContext() ctx: RequestContext, @Param('id') id: number) {
    return this.orderService.remove(ctx, +id);
  }

  @Get('orders/me')
  @ApiOperation({
    summary: 'Get orders for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The order has been successfully get order by me.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@ReqContext() ctx: RequestContext) {
    const orders = await this.orderService.getOrdersByUser(ctx);
    return { data: orders, meta: {} };
  }
}
