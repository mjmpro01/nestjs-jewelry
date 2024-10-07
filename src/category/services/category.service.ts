import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { Action } from '../../shared/acl/action.constant';
import { Actor } from '../../shared/acl/actor.constant';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { slugify } from '../../shared/utils/slugify';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../dtos/category-input.dto';
import { CategoryOutput } from '../dtos/category-output.dto';
import { GetCategoriesQueryDto } from '../dtos/category-query.dto';
import { Category } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryAclService } from './category-acl.services';

@Injectable()
export class CategoryService {
  constructor(
    private repository: CategoryRepository,
    private aclService: CategoryAclService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(CategoryService.name);
  }

  async createCategory(
    ctx: RequestContext,
    input: CreateCategoryInput,
  ): Promise<CategoryOutput> {
    this.logger.log(ctx, `${this.createCategory.name} was called`);

    const category = plainToClass(Category, input);
    category.slug = slugify(input.name);

    const actor: Actor = ctx.user!;

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Create, category);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    this.logger.log(ctx, `calling ${CategoryRepository.name}.save`);
    const savedCategory = await this.repository.save(category);

    return plainToClass(CategoryOutput, savedCategory, {
      excludeExtraneousValues: true,
    });
  }

  async getCategories(
    ctx: RequestContext,
    query: GetCategoriesQueryDto,
  ): Promise<{ categories: CategoryOutput[]; count: number }> {
    const [categories, count] = await this.repository.findAndCount({
      where: {
        ...(query.name && { name: query.name }),
      },
      relations: ['products'],
      take: query.limit,
      skip: query.offset,
    });

    const categoriesOutput = plainToClass(CategoryOutput, categories, {
      excludeExtraneousValues: true,
    });

    return { categories: categoriesOutput, count };
  }

  async getCategoryById(
    ctx: RequestContext,
    id: number,
  ): Promise<CategoryOutput> {
    this.logger.log(ctx, `${this.getCategoryById.name} was called`);

    this.logger.log(ctx, `calling ${CategoryRepository.name}.getById`);
    const category = await this.repository.getById(id);

    return plainToClass(CategoryOutput, category, {
      excludeExtraneousValues: true,
    });
  }

  async getCategoryBySlug(
    ctx: RequestContext,
    slug: string,
  ): Promise<CategoryOutput> {
    const category = await this.repository.getBySlug(slug);

    return plainToClass(CategoryOutput, category, {
      excludeExtraneousValues: true,
    });
  }

  async updateCategory(
    ctx: RequestContext,
    categoryId: number,
    input: UpdateCategoryInput,
  ): Promise<CategoryOutput> {
    this.logger.log(ctx, `${this.updateCategory.name} was called`);

    this.logger.log(ctx, `calling ${CategoryRepository.name}.getById`);
    const category = await this.repository.getById(categoryId);

    const actor: Actor = ctx.user!;

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Update, category);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    const updatedCategory: Category = {
      ...category,
      ...input,
    };

    if (input.name) {
      updatedCategory.slug = slugify(input.name);
    }

    this.logger.log(ctx, `calling ${CategoryRepository.name}.save`);
    const savedCategory = await this.repository.save(updatedCategory);

    return plainToClass(CategoryOutput, savedCategory, {
      excludeExtraneousValues: true,
    });
  }

  async deleteCategory(ctx: RequestContext, id: number): Promise<void> {
    this.logger.log(ctx, `${this.deleteCategory.name} was called`);

    this.logger.log(ctx, `calling ${CategoryRepository.name}.getById`);
    const category = await this.repository.getById(id);

    const actor: Actor = ctx.user!;

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Delete, category);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    this.logger.log(ctx, `calling ${CategoryRepository.name}.remove`);
    await this.repository.remove(category);
  }
}
