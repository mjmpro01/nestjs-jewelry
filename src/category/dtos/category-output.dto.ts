import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { ProductOutput } from '../../product/dtos/product-output.dto';

export class CategoryOutput {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @Type(() => ProductOutput)
  @ApiProperty({ type: () => [ProductOutput] })
  products: ProductOutput[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}


