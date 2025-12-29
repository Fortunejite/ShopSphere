import {
  getDownloadURL,
  getStorage,
  ref,
  deleteObject,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '.';

const storage = getStorage(app);

export const uploadImage = async (file: File, url?: string) => {
  if (url) {
    const oldRef = ref(storage, url);
    await deleteObject(oldRef);
  }
  const storageRef = ref(
    storage,
    `medias/image/${Date.now()}-${file.name}`,
  );
  const uploadTask = await uploadBytesResumable(storageRef, file);
  return await getDownloadURL(uploadTask.ref);
};

export const deleteImage = async (url: string) => {
  const imageRef = ref(storage, url);
  await deleteObject(imageRef);
}