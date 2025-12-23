import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '.';

const storage = getStorage(app);

export const uploadImage = async (file: File) => {
  const storageRef = ref(
    storage,
    `medias/image/${Date.now()}-${file.name}`,
  );
  const uploadTask = await uploadBytesResumable(storageRef, file);
  return await getDownloadURL(uploadTask.ref);
};