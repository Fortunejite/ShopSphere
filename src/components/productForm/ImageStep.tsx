import Image from 'next/image';
import { Label } from '@radix-ui/react-label';
import { ImageOff, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ProductFormData, UpdateFormData } from './ProductStepForm';
import { useState, useEffect } from 'react';
import { uploadPhoto, uploadMultiplePhotos } from '@/lib/uploadPhoto';
import { InlineLoading } from '../Loading';

interface Props {
  formData: ProductFormData;
  updateFormData: UpdateFormData;
  onUploadStateChange?: (isUploading: boolean) => void;
}

const ImageStep = ({ formData, updateFormData, onUploadStateChange }: Props) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<boolean[]>([]);
  const [isUploadingMain, setIsUploadingMain] = useState<boolean>(false);
  const [isUploadingThumbnails, setIsUploadingThumbnails] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Notify parent component of upload state changes
  useEffect(() => {
    const isUploading = isUploadingMain || isUploadingThumbnails;
    onUploadStateChange?.(isUploading);
  }, [isUploadingMain, isUploadingThumbnails, onUploadStateChange]);

  // Sync thumbnail errors array with thumbnails array length
  useEffect(() => {
    if (thumbnailErrors.length !== formData.thumbnails.length) {
      const newErrors = new Array(formData.thumbnails.length).fill(false);
      // Copy existing error states for indices that still exist
      for (let i = 0; i < Math.min(thumbnailErrors.length, formData.thumbnails.length); i++) {
        newErrors[i] = thumbnailErrors[i] || false;
      }
      setThumbnailErrors(newErrors);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.thumbnails.length, thumbnailErrors.length]);
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="image">Main Product Image *</Label>
        <div className="space-y-3 mt-1">
          {/* File upload */}
          <div className="flex flex-col gap-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setIsUploadingMain(true);
                  setUploadError('');
                  setImageError(false);
                  
                  // Create temporary URL for immediate preview
                  const tempUrl = URL.createObjectURL(file);
                  updateFormData('image', tempUrl);
                  
                  try {
                    // Upload the actual file
                    const result = await uploadPhoto(file);
                    
                    if (result.success) {
                      // Replace temporary URL with permanent URL
                      updateFormData('image', result.url);
                      // Clean up temporary URL
                      URL.revokeObjectURL(tempUrl);
                    } else {
                      setUploadError(result.error || 'Failed to upload image');
                      setImageError(true);
                    }
                  } catch {
                    setUploadError('Upload failed. Please try again.');
                    setImageError(true);
                  } finally {
                    setIsUploadingMain(false);
                  }
                }
              }}
              className="w-full"
              disabled={isUploadingMain}
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Upload an image file (JPG, PNG, WebP, etc.)
              </p>
              {isUploadingMain && (
                <InlineLoading />
              )}
            </div>
            {uploadError && (
              <p className="text-sm text-red-600 mt-1">{uploadError}</p>
            )}
          </div>

          {/* Image preview */}
          {formData.image && (
            <div className="mt-3">
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {!imageError ? (
                  <Image
                    src={formData.image}
                    alt="Product preview"
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <ImageOff className="w-12 h-12" />
                    <p className="text-sm text-center px-4">
                      Failed to load selected image
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Clean up object URL if it's a blob URL
                        if (formData.image.startsWith('blob:')) {
                          URL.revokeObjectURL(formData.image);
                        }
                        updateFormData('image', '');
                        setImageError(false);
                        setUploadError('');
                      }}
                      className="text-xs"
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Additional Images (Thumbnails)</Label>
        <div className="space-y-3 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.multiple = true;
              input.onchange = async (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files && files.length > 0) {
                  setIsUploadingThumbnails(true);
                  setUploadError('');
                  
                  const fileArray = Array.from(files);
                  const currentThumbnails = [...formData.thumbnails];
                  const availableSlots = 10 - currentThumbnails.length;
                  const filesToUpload = fileArray.slice(0, availableSlots);
                  
                  if (filesToUpload.length === 0) {
                    setIsUploadingThumbnails(false);
                    setUploadError('No available slots for new images');
                    return;
                  }
                  
                  // Create temporary URLs for immediate preview
                  const newThumbnails = [...currentThumbnails];
                  const newErrors = [...thumbnailErrors];
                  const tempUrls: string[] = [];
                  const startIndex = currentThumbnails.length;
                  
                  filesToUpload.forEach((file) => {
                    const tempUrl = URL.createObjectURL(file);
                    tempUrls.push(tempUrl);
                    newThumbnails.push(tempUrl);
                    newErrors.push(false);
                  });
                  
                  updateFormData('thumbnails', newThumbnails);
                  setThumbnailErrors(newErrors);
                  
                  try {
                    // Upload the actual files
                    const results = await uploadMultiplePhotos(filesToUpload);
                    
                    // Replace temporary URLs with permanent URLs
                    const finalThumbnails = [...newThumbnails];
                    const finalErrors = [...newErrors];
                    
                    results.forEach((result, index) => {
                      const thumbnailIndex = startIndex + index;
                      if (result.success) {
                        finalThumbnails[thumbnailIndex] = result.url;
                        // Clean up temporary URL
                        URL.revokeObjectURL(tempUrls[index]);
                        finalErrors[thumbnailIndex] = false;
                      } else {
                        // Mark as error but keep the temp URL for user to see what failed
                        finalErrors[thumbnailIndex] = true;
                        console.error('Thumbnail upload failed:', result.error);
                        setUploadError(`Failed to upload image ${index + 1}: ${result.error || 'Unknown error'}`);
                      }
                    });
                    
                    updateFormData('thumbnails', finalThumbnails);
                    setThumbnailErrors(finalErrors);
                    
                  } catch (error) {
                    console.error('Thumbnails upload failed:', error);
                    // Mark all new thumbnails as errored
                    const errorThumbnails = [...newErrors];
                    for (let i = 0; i < filesToUpload.length; i++) {
                      errorThumbnails[startIndex + i] = true;
                    }
                    setThumbnailErrors(errorThumbnails);
                    setUploadError('Failed to upload thumbnails. Please try again.');
                  } finally {
                    setIsUploadingThumbnails(false);
                  }
                }
              };
              input.click();
            }}
            disabled={formData.thumbnails.length >= 10 || isUploadingThumbnails}
            className="w-full sm:w-auto"
          >
            {isUploadingThumbnails ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isUploadingThumbnails
              ? 'Uploading...'
              : formData.thumbnails.length === 0
              ? 'Add Thumbnail Images'
              : `Add More Images (${formData.thumbnails.length}/10)`}
          </Button>

          {formData.thumbnails.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {formData.thumbnails.map((thumbnail, index) => (
                <div 
                  key={`thumbnail-${index}`} 
                  className="relative group"
                  title={thumbnailErrors[index] ? 'Failed to upload this image' : `Thumbnail ${index + 1}`}
                >
                  <div className={`aspect-square bg-gray-100 rounded-lg overflow-hidden ${
                    thumbnailErrors[index] ? 'border-2 border-red-300 border-dashed' : ''
                  }`}>
                    {!thumbnailErrors[index] ? (
                      <Image
                        src={thumbnail}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={() => {
                          console.error(`Failed to load thumbnail ${index + 1}:`, thumbnail);
                          const newErrors = [...thumbnailErrors];
                          newErrors[index] = true;
                          setThumbnailErrors(newErrors);
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-red-400 p-2">
                        <ImageOff className="w-6 h-6 mb-1" />
                        <span className="text-xs text-center">
                          Upload failed
                        </span>
                        <span className="text-xs text-center text-gray-500 mt-1">
                          Click × to remove
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const thumbnailToRemove = formData.thumbnails[index];
                      
                      // Clean up object URL if it's a blob URL
                      if (thumbnailToRemove.startsWith('blob:')) {
                        URL.revokeObjectURL(thumbnailToRemove);
                      }
                      
                      const newThumbnails = formData.thumbnails.filter(
                        (_, i) => i !== index,
                      );
                      updateFormData('thumbnails', newThumbnails);
                      const newErrors = thumbnailErrors.filter(
                        (_, i) => i !== index,
                      );
                      setThumbnailErrors(newErrors);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="text-sm text-gray-500 space-y-1">
            <p>You can upload up to 10 additional images. Supported formats: JPG, PNG, WebP, GIF.</p>
            <p>Maximum file size: 10MB per image.</p>
            {formData.thumbnails.length > 0 && (
              <p className="text-blue-600">
                {formData.thumbnails.length}/10 images uploaded
                {thumbnailErrors.some(error => error) && (
                  <span className="text-red-600 ml-2">
                    (Some uploads failed - hover over images to see details)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStep;
