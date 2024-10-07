import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class OrderItemDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
