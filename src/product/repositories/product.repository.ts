import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<Product> {
    const product = await this.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async getBySlug(slug: string): Promise<Product> {
    const product = await this.findOne({
      where: { slug },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }
    return product;
  }
}
