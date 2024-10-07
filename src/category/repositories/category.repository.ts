import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<Category> {
    const category = await this.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async getBySlug(slug: string): Promise<Category> {
    const category = await this.findOne({
      where: { slug },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }
}

export default function Component() {
  return null;
}
