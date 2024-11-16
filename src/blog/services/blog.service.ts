import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { Action } from '../../shared/acl/action.constant';
import { Actor } from '../../shared/acl/actor.constant';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { handleSlug } from '../../shared/utils/slugify';
import {
  CreateBlogInput,
  UpdateBlogInput,
} from '../dtos/blog-input.dto';
import { BlogOutput } from '../dtos/blog-output.dto';
import { GetBlogQueryDto } from '../dtos/blog-query.dto';
import { Blog } from '../entities/blog.entity';
import { BlogRepository } from '../repositories/blog.repository';
import { BlogAclService } from './blog-acl.services';

@Injectable()
export class BlogService {
  constructor(
    private repository: BlogRepository,
    private aclService: BlogAclService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(BlogService.name);
  }

  async createBlog(
    ctx: RequestContext,
    input: CreateBlogInput,
  ): Promise<BlogOutput> {
    this.logger.log(ctx, `${this.createBlog.name} was called`);

    const blog = plainToClass(Blog, input);
    blog.slug = handleSlug(input.title);

    const actor: Actor = ctx.user!;

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Create, blog);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    this.logger.log(ctx, `calling ${BlogRepository.name}.save`);
    const savedCategory = await this.repository.save(blog);

    return plainToClass(BlogOutput, savedCategory, {
      excludeExtraneousValues: true,
    });
  }

  async getBlogs(
    ctx: RequestContext,
    query: GetBlogQueryDto,
  ): Promise<{ blogs: BlogOutput[]; pagination: any }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const [blogs, total] = await this.repository.findAndCount({
      where: {
        ...(query.title && { title: query.title }),
      },
      take: pageSize,
      skip: skip,
    });

    const blogsOutput = plainToClass(BlogOutput, blogs, {
      excludeExtraneousValues: true,
    });
    const pageCount = Math.ceil(total / pageSize);

    return {
      blogs: blogsOutput,
      pagination: {
        page,
        pageSize,
        pageCount,
        total,
      },
    };
  }

  async getBlogById(
    ctx: RequestContext,
    id: number,
  ): Promise<BlogOutput> {
    this.logger.log(ctx, `${this.getBlogById.name} was called`);

    this.logger.log(ctx, `calling ${BlogRepository.name}.getById`);
    const category = await this.repository.getById(id);

    return plainToClass(BlogOutput, category, {
      excludeExtraneousValues: true,
    });
  }

  async getBlogBySlug(
    ctx: RequestContext,
    slug: string,
  ): Promise<BlogOutput> {
    const category = await this.repository.getBySlug(slug);

    return plainToClass(BlogOutput, category, {
      excludeExtraneousValues: true,
    });
  }

  async updateBlog(
    ctx: RequestContext,
    categoryId: number,
    input: UpdateBlogInput,
  ): Promise<BlogOutput> {
    this.logger.log(ctx, `${this.updateBlog.name} was called`);

    this.logger.log(ctx, `calling ${BlogRepository.name}.getById`);
    const blog = await this.repository.getById(categoryId);

    const actor: Actor = ctx.user!;

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Update, blog);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    const updatedBlog: Blog = {
      ...blog,
      ...input,
    };

    if (input.title) {
      updatedBlog.slug = handleSlug(input.title);
    }

    this.logger.log(ctx, `calling ${BlogRepository.name}.save`);
    const savedCategory = await this.repository.save(updatedBlog);

    return plainToClass(BlogOutput, savedCategory, {
      excludeExtraneousValues: true,
    });
  }

  async deleteBlog(ctx: RequestContext, id: number): Promise<void> {
    this.logger.log(ctx, `${this.deleteBlog.name} was called`);

    this.logger.log(ctx, `calling ${BlogRepository.name}.getById`);
    const blog = await this.repository.getById(id);

    const actor: Actor = ctx.user!;

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Delete, blog);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    this.logger.log(ctx, `calling ${BlogRepository.name}.remove`);
    await this.repository.remove(blog);
  }
}
