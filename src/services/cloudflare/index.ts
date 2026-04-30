import { S3Client } from '@aws-sdk/client-s3';

// Environment variables
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESSKEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
export const bucketName = process.env.R2_BUCKET_NAME

if (!cloudflareAccountId || !accessKeyId || !secretAccessKey || !bucketName) {
  throw Error('Cloudflare environment variable not setup')
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${cloudflareAccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
