import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

import { CreateOrderDto } from './create-order.dto';

export class  UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsNumber()
  userId: number;

  user: User;
}
