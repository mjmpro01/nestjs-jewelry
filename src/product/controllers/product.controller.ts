import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../shared/logger/logger.service';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  CreateProductInput,
  UpdateProductInput,
} from '../dtos/product-input.dto';
import { ProductOutput } from '../dtos/product-output.dto';
import { GetProductQueryDto } from '../dtos/product-query.dto';
import { ProductService } from '../services/product.service';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ProductController.name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create product API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(ProductOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @ReqContext() ctx: RequestContext,
    @Body() input: CreateProductInput,
  ): Promise<BaseApiResponse<ProductOutput>> {
    const product = await this.productService.createProduct(ctx, input);
    return { data: product, meta: {} };
  }

  @Get()
  @ApiOperation({
    summary: 'Get products as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([ProductOutput]),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getProducts(
    @ReqContext() ctx: RequestContext,
    @Query() query: GetProductQueryDto,
  ): Promise<BaseApiResponse<ProductOutput[]>> {
    this.logger.log(ctx, `${this.getProducts.name} was called`);

    const { products, count } = await this.productService.getProducts(
      ctx,
      query
    );

    return { data: products, meta: { count } };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProductOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getProduct(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<BaseApiResponse<ProductOutput>> {
    this.logger.log(ctx, `${this.getProduct.name} was called`);

    const product = await this.productService.getProductById(ctx, id);
    return { data: product, meta: {} };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update product API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(ProductOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateProduct(
    @ReqContext() ctx: RequestContext,
    @Param('id') productId: number,
    @Body() input: UpdateProductInput,
  ): Promise<BaseApiResponse<ProductOutput>> {
    const product = await this.productService.updateProduct(
      ctx,
      productId,
      input,
    );
    return { data: product, meta: {} };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product by id API',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteProduct(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<void> {
    this.logger.log(ctx, `${this.deleteProduct.name} was called`);

    return this.productService.deleteProduct(ctx, id);
  }
}

// This is not a React component, but we're using the React code block for TypeScript syntax highlighting
