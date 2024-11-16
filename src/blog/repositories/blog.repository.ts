import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Blog } from '../entities/blog.entity';

@Injectable()
export class BlogRepository extends Repository<Blog> {
  constructor(private dataSource: DataSource) {
    super(Blog, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<Blog> {
    const blog = await this.findOne({
      where: { id }
    });
    if (!blog) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return blog;
  }

  async getBySlug(slug: string): Promise<Blog> {
    const blog = await this.findOne({
      where: { slug }
    });
    if (!blog) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return blog;
  }
}

export default function Component() {
  return null;
}
