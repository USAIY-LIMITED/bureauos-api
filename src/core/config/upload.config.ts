import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
  endpoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER || 'bureauos_minio',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'bureauos_minio_secret',
  bucket: process.env.MINIO_BUCKET || 'bureauos-blog',
  publicUrl: process.env.MINIO_PUBLIC_URL || '',
}));
