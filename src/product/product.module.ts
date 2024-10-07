import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { CategoryModule } from '../category/category.module';
import { SharedModule } from '../shared/shared.module';
import { ProductController } from './controllers/product.controller';
import { Product } from './entities/product.entity';
import { ProductRepository } from './repositories/product.repository';
import { ProductService } from './services/product.service';
import { ProductAclService } from './services/product-acl.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Product]), CategoryModule],
  providers: [
    ProductService,
    JwtAuthStrategy,
    ProductAclService,
    ProductRepository,
  ],
  controllers: [ProductController],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}

// This is not a React component, but we're using the React code block for TypeScript
