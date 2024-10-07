import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FileUploadDto } from './dto/file-upload.dto';
import { S3UploadService } from './s3-upload.service';

@ApiTags('s3-upload')
@Controller('upload')
export class S3UploadController {
  constructor(private readonly s3UploadService: S3UploadService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a file to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    type: FileUploadDto,
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = `uploads/${Date.now()}-${file.originalname}`;
    const url = await this.s3UploadService.uploadFile(file, key);
    return { url };
  }
}
