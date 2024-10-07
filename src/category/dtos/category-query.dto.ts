import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationParamsDto } from '../../shared/dtos/pagination-params.dto';

export class GetCategoriesQueryDto extends PaginationParamsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
