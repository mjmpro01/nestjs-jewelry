import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { CategoryService } from '../../category/services/category.service';
import { Action } from '../../shared/acl/action.constant';
import { Actor } from '../../shared/acl/actor.constant';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { slugify } from '../../shared/utils/slugify';
import {
  CreateProductInput,
  UpdateProductInput,
} from '../dtos/product-input.dto';
import { ProductOutput } from '../dtos/product-output.dto';
import { GetProductQueryDto } from '../dtos/product-query.dto';
import { Product } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { ProductAclService } from './product-acl.service';

@Injectable()
export class ProductService {
  constructor(
    private repository: ProductRepository,
    private aclService: ProductAclService,
    private categoryService: CategoryService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ProductService.name);
  }

  async createProduct(
    ctx: RequestContext,
    input: CreateProductInput,
  ): Promise<ProductOutput> {
    this.logger.log(ctx, `${this.createProduct.name} was called`);

    const actor: Actor = ctx.user!;

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Create, Product);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    const category = await this.categoryService.getCategoryById(
      ctx,
      input.categoryId,
    );

    const product = plainToClass(Product, input);
    product.slug = slugify(input.name);
    product.category = category;

    this.logger.log(ctx, `calling ${ProductRepository.name}.save`);
    const savedProduct = await this.repository.save(product);

    return plainToClass(ProductOutput, savedProduct, {
      excludeExtraneousValues: true,
    });
  }

  async getProducts(
    ctx: RequestContext,
    query: GetProductQueryDto,
  ): Promise<{ products: ProductOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getProducts.name} was called`);

    this.logger.log(ctx, `calling ${ProductRepository.name}.findAndCount`);
    const queryBuilder = this.repository.createQueryBuilder('product');

    if (query.name) {
      queryBuilder.andWhere('product.name LIKE :name', {
        name: `%${query.name}%`,
      });
    }

    if (query.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.price) {
      queryBuilder.andWhere('product.price = :price', { price: query.price });
    }

    // Apply dynamic sorting with ORDER BY
    if (query.orderBy) {
      queryBuilder.orderBy(`product.${query.orderBy}`, query.order);
    } else {
      // Default sorting if none provided
      queryBuilder.orderBy('product.createdAt', 'DESC');
    }
    const [products, count] = await queryBuilder.getManyAndCount();

    const productsOutput = plainToClass(ProductOutput, products, {
      excludeExtraneousValues: true,
    });

    return { products: productsOutput, count };
  }

  async getProductById(
    ctx: RequestContext,
    id: number,
  ): Promise<ProductOutput> {
    this.logger.log(ctx, `${this.getProductById.name} was called`);

    // const actor: Actor = ctx.user!;

    this.logger.log(ctx, `calling ${ProductRepository.name}.getById`);
    const product = await this.repository.getById(id);

    // const isAllowed = this.aclService
    //   .forActor(actor)
    //   .canDoAction(Action.Read, product);
    // if (!isAllowed) {
    //   throw new UnauthorizedException();
    // }

    return plainToClass(ProductOutput, product, {
      excludeExtraneousValues: true,
    });
  }

  async getProductBySlug(
    ctx: RequestContext,
    slug: string,
  ): Promise<ProductOutput> {
    this.logger.log(ctx, `${this.getProductBySlug.name} was called`);

    const actor: Actor = ctx.user!;

    this.logger.log(ctx, `calling ${ProductRepository.name}.getBySlug`);
    const product = await this.repository.getBySlug(slug);

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Read, product);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    return plainToClass(ProductOutput, product, {
      excludeExtraneousValues: true,
    });
  }

  async updateProduct(
    ctx: RequestContext,
    productId: number,
    input: UpdateProductInput,
  ): Promise<ProductOutput> {
    this.logger.log(ctx, `${this.updateProduct.name} was called`);

    const actor: Actor = ctx.user!;

    this.logger.log(ctx, `calling ${ProductRepository.name}.getById`);
    const product = await this.repository.getById(productId);

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Update, product);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    const updatedProduct: Product = {
      ...product,
      ...input,
    };

    if (input.name) {
      updatedProduct.slug = slugify(input.name);
    }

    if (input.categoryId) {
      const category = await this.categoryService.getCategoryById(
        ctx,
        input.categoryId,
      );
      updatedProduct.category = category;
    }

    this.logger.log(ctx, `calling ${ProductRepository.name}.save`);
    const savedProduct = await this.repository.save(updatedProduct);

    return plainToClass(ProductOutput, savedProduct, {
      excludeExtraneousValues: true,
    });
  }

  async deleteProduct(ctx: RequestContext, id: number): Promise<void> {
    this.logger.log(ctx, `${this.deleteProduct.name} was called`);

    const actor: Actor = ctx.user!;

    this.logger.log(ctx, `calling ${ProductRepository.name}.getById`);
    const product = await this.repository.getById(id);

    const isAllowed = this.aclService
      .forActor(actor)
      .canDoAction(Action.Delete, product);
    if (!isAllowed) {
      throw new UnauthorizedException();
    }

    this.logger.log(ctx, `calling ${ProductRepository.name}.remove`);
    await this.repository.remove(product);
  }
}

export default function Component() {
  return null;
}
