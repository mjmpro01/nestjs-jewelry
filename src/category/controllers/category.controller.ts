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
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../dtos/category-input.dto';
import { CategoryOutput } from '../dtos/category-output.dto';
import { GetCategoriesQueryDto } from '../dtos/category-query.dto';
import { CategoryService } from '../services/category.service';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(CategoryController.name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create category API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(CategoryOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createCategory(
    @ReqContext() ctx: RequestContext,
    @Body() input: CreateCategoryInput,
  ): Promise<BaseApiResponse<CategoryOutput>> {
    const category = await this.categoryService.createCategory(ctx, input);
    return { data: category, meta: {} };
  }

  @Get()
  @ApiOperation({
    summary: 'Get categories as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CategoryOutput]),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getCategories(
    @ReqContext() ctx: RequestContext,
    @Query() query: GetCategoriesQueryDto,
  ): Promise<BaseApiResponse<CategoryOutput[]>> {
    this.logger.log(ctx, `${this.getCategories.name} was called`);

    const { categories, count } = await this.categoryService.getCategories(
      ctx,
      query,
    );

    return { data: categories, meta: { count } };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CategoryOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getCategory(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<BaseApiResponse<CategoryOutput>> {
    this.logger.log(ctx, `${this.getCategory.name} was called`);

    const category = await this.categoryService.getCategoryById(ctx, id);
    return { data: category, meta: {} };
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get category by slug API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CategoryOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getCategoryBySlug(
    @ReqContext() ctx: RequestContext,
    @Param('slug') slug: string,
  ): Promise<BaseApiResponse<CategoryOutput>> {
    this.logger.log(ctx, `${this.getCategoryBySlug.name} was called`);

    const category = await this.categoryService.getCategoryBySlug(ctx, slug);
    return { data: category, meta: {} };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update category API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CategoryOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @ReqContext() ctx: RequestContext,
    @Param('id') categoryId: number,
    @Body() input: UpdateCategoryInput,
  ): Promise<BaseApiResponse<CategoryOutput>> {
    const category = await this.categoryService.updateCategory(
      ctx,
      categoryId,
      input,
    );
    return { data: category, meta: {} };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete category by id API',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteCategory(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<void> {
    this.logger.log(ctx, `${this.deleteCategory.name} was called`);

    return this.categoryService.deleteCategory(ctx, id);
  }
}
