import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { SharedModule } from '../shared/shared.module';
import { CategoryController } from './controllers/category.controller';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryService } from './services/category.service';
import { CategoryAclService } from './services/category-acl.services';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Category])],
  providers: [
    CategoryService,
    JwtAuthStrategy,
    CategoryAclService,
    CategoryRepository,
  ],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}

// This is not a React component, but we're using the React code block for TypeScript syntax highlighting
