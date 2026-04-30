import { v4 as uuidv4 } from 'uuid';
import { bucketName, r2Client } from '../..';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface GeneratePresignedUrlPramaters {
  fileType: string;
  fileSize: number;
  folder: string;
}

// Configs
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const generatePresignedUrl = async ({
  fileType,
  fileSize,
  folder,
}: GeneratePresignedUrlPramaters) => {
  if (!ALLOWED_TYPES.includes(fileType)) throw Error('Invalid file type');
  if (fileSize > MAX_SIZE) throw Error('File too large');

  const ext = fileType.split('/')[1];
  const key = `${folder}/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 60, // 60 seconds
  });

  return { presignedUrl, key };
};

export const deleteFromR2 = async (key: string) => {
  await r2Client.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  }));
}