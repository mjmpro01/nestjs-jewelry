import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { SharedModule } from '../shared/shared.module';
import { BlogController } from './controllers/blog.controller';
import { Blog } from './entities/blog.entity';
import { BlogRepository } from './repositories/blog.repository';
import { BlogService } from './services/blog.service';
import { BlogAclService } from './services/blog-acl.services';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Blog])],
  providers: [
    BlogService,
    JwtAuthStrategy,
    BlogAclService,
    BlogRepository,
  ],
  controllers: [BlogController],
  exports: [BlogService],
})
export class BlogModule {}

// This is not a React component, but we're using the React code block for TypeScript syntax highlighting
