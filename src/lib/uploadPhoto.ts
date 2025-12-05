/**
 * Utility function for photo uploads
 * Currently returns a placeholder URL - to be implemented with actual upload logic later
 */

export interface UploadResult {
  url: string;
  success: boolean;
  error?: string;
}

/**
 * Uploads a single photo and returns the URL
 * @param file - The file to upload
 * @returns Promise with upload result
 */
export async function uploadPhoto(file: File): Promise<UploadResult> {
  try {
    // Validate file first
    const validation = validatePhoto(file);
    if (!validation.valid) {
      return {
        url: '',
        success: false,
        error: validation.error
      };
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, return a placeholder URL
    return {
      url: '/placeholder.png',
      success: true
    };
  } catch (error) {
    return {
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Uploads multiple photos and returns array of URLs
 * @param files - Array of files to upload
 * @returns Promise with array of upload results
 */
export async function uploadMultiplePhotos(files: File[]): Promise<UploadResult[]> {
  try {
    const uploadPromises = files.map(file => uploadPhoto(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    return files.map(() => ({
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }));
  }
}

/**
 * Validates file type and size before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns Validation result
 */
export function validatePhoto(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  return { valid: true };
}
