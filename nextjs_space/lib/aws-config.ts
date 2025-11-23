
import { S3Client } from '@aws-sdk/client-s3';

/**
 * Get S3 bucket configuration from environment variables
 */
export function getBucketConfig() {
  return {
    bucketName: process.env.AWS_BUCKET_NAME || '',
    folderPrefix: process.env.AWS_FOLDER_PREFIX || '',
  };
}

/**
 * Create and configure S3 client
 * Uses AWS SDK v3
 */
export function createS3Client(): S3Client {
  return new S3Client({
    // Credentials are automatically loaded from environment variables
    // AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
  });
}
