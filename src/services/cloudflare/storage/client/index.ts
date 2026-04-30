import axios from 'axios';

const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
if (!publicUrl) {
  throw Error('Cloudflare public URL environment variable not setup');
}

export const generatePublicUrl = (key: string) => `${publicUrl}/${key}`;

export const uploadMedia = async (file: File, folder: string) => {
  const res = await axios.post('/api/upload-url', {
    fileType: file.type,
    fileSize: file.size,
    folder,
  });

  const { presignedUrl, key } = res.data;

  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });

  return generatePublicUrl(key);
};

export const deleteMedia = async (key: string) => {
  await axios.delete('/api/upload-url?key=' + key);
};
