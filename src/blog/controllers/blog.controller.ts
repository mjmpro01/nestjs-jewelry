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
  CreateBlogInput,
  UpdateBlogInput,
} from '../dtos/blog-input.dto';
import { BlogOutput } from '../dtos/blog-output.dto';
import { GetBlogQueryDto } from '../dtos/blog-query.dto';
import { BlogService } from '../services/blog.service';

@ApiTags('blogs')
@Controller('blogs')
export class BlogController {
  constructor(
    private readonly BlogService: BlogService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(BlogController.name);
  }

  @Post()
  @ApiOperation({
    summary: 'Create Blog API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(BlogOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @ReqContext() ctx: RequestContext,
    @Body() input: CreateBlogInput,
  ): Promise<BaseApiResponse<BlogOutput>> {
    const Blog = await this.BlogService.createBlog(ctx, input);
    return { data: Blog, meta: {} };
  }

  @Get()
  @ApiOperation({
    summary: 'Get categories as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([BlogOutput]),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getCategories(
    @ReqContext() ctx: RequestContext,
    @Query() query: GetBlogQueryDto,
  ): Promise<BaseApiResponse<BlogOutput[]>> {
    this.logger.log(ctx, `${this.getCategories.name} was called`);

    const { blogs, pagination } = await this.BlogService.getBlogs(
      ctx,
      query,
    );

    return { data: blogs, meta: { pagination } };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Blog by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BlogOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getBlog(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<BaseApiResponse<BlogOutput>> {
    this.logger.log(ctx, `${this.getBlog.name} was called`);

    const Blog = await this.BlogService.getBlogById(ctx, id);
    return { data: Blog, meta: {} };
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get Blog by slug API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BlogOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getBlogBySlug(
    @ReqContext() ctx: RequestContext,
    @Param('slug') slug: string,
  ): Promise<BaseApiResponse<BlogOutput>> {
    this.logger.log(ctx, `${this.getBlogBySlug.name} was called`);

    const Blog = await this.BlogService.getBlogBySlug(ctx, slug);
    return { data: Blog, meta: {} };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Blog API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BlogOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateBlog(
    @ReqContext() ctx: RequestContext,
    @Param('id') BlogId: number,
    @Body() input: UpdateBlogInput,
  ): Promise<BaseApiResponse<BlogOutput>> {
    const Blog = await this.BlogService.updateBlog(
      ctx,
      BlogId,
      input,
    );
    return { data: Blog, meta: {} };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Blog by id API',
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

    return this.BlogService.deleteBlog(ctx, id);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get product by slug API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BlogOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getProductBySlug(
    @ReqContext() ctx: RequestContext,
    @Param('slug') slug: string,
  ): Promise<BaseApiResponse<BlogOutput>> {
    this.logger.log(ctx, `${this.getProductBySlug.name} was called`);

    const category = await this.BlogService.getBlogBySlug(ctx, slug);
    return { data: category, meta: {} };
  }

}
