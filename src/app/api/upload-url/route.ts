import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import { deleteFromR2, generatePresignedUrl } from '@/services/cloudflare/storage/server';

export const POST = errorHandler(async (request) => {
  const body = await request.json();

  const { presignedUrl, key } = await generatePresignedUrl(body);
  return NextResponse.json({ presignedUrl, key });
});

export const DELETE = errorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  await deleteFromR2(key);
  return NextResponse.json({ success: true });
});