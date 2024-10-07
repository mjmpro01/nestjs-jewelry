import { Test, TestingModule } from '@nestjs/testing';

import { S3UploadController } from './s3-upload.controller';

describe('S3UploadController', () => {
  let controller: S3UploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [S3UploadController],
    }).compile();

    controller = module.get<S3UploadController>(S3UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
