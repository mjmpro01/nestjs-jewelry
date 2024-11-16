import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { CategoryOutput } from '../../category/dtos/category-output.dto';

export class ProductOutput {
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
  @ApiProperty()
  price: number;

  // @Expose()
  // @ApiProperty()
  // sku: string;

  @Expose()
  @ApiProperty()
  stockQuantity: number;

  @Expose()
  @ApiProperty()
  categoryId: number;

  @Expose()
  @Type(() => CategoryOutput)
  @ApiProperty({ type: () => CategoryOutput })
  category: CategoryOutput;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  image: string;

  @Expose()
  @ApiProperty()
  gallery: string[];

  @Expose()
  @ApiProperty()
  totalPurchases: number;

}
