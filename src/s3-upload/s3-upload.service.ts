import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3UploadService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('awsS3.region'),
      credentials: {
        accessKeyId: `${this.configService.get<string>('awsS3.accessKeyId')}`,
        secretAccessKey: `${this.configService.get<string>(
          'awsS3.secretAccessKey',
        )}`,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const command = new PutObjectCommand({
      ACL: 'public-read',
      Bucket: this.configService.get<string>('awsS3.bucketName'),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      return `https://${this.configService.get<string>('awsS3.bucketName')}.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }
}
