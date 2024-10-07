import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { S3UploadModule } from './s3-upload/s3-upload.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    S3UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
