import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import uploadConfig from '@app/core/config/upload.config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject(uploadConfig.KEY)
    private readonly config: ConfigType<typeof uploadConfig>,
  ) {
    this.bucket = config.bucket;

    this.s3 = new S3Client({
      endpoint: `${config.useSSL ? 'https' : 'http'}://${config.endpoint}:${config.port}`,
      region: 'us-east-1', // MinIO ignores this, but the SDK requires it
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" already exists`);
    } catch {
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket "${this.bucket}" created successfully`);
      } catch (createError) {
        this.logger.warn(
          `Could not create bucket "${this.bucket}": ${createError.message}. Upload features may not work until the storage service is available.`,
        );
      }
    }
  }

  /**
   * Upload a file to S3/MinIO.
   * @param file Multer file object
   * @param folder Optional subfolder (e.g., 'blog/covers')
   * @returns The public URL of the uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<{ url: string; key: string }> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${uuid()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const publicUrl = this.config.publicUrl
      ? `${this.config.publicUrl}/${this.bucket}/${key}`
      : `${this.config.useSSL ? 'https' : 'http'}://${this.config.endpoint}:${this.config.port}/${this.bucket}/${key}`;

    return { url: publicUrl, key };
  }

  /**
   * Delete a file from S3/MinIO by its key.
   */
  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
