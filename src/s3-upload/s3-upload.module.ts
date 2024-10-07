import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { S3UploadController } from './s3-upload.controller';
import { S3UploadService } from './s3-upload.service';

@Module({
  imports: [ConfigModule],
  providers: [S3UploadService],
  controllers: [S3UploadController],
  exports: [S3UploadService],
})
export class S3UploadModule {}
