import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentURL {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  order_code: string;
}
