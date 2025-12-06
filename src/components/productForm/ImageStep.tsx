import Image from 'next/image';
import { Label } from '@radix-ui/react-label';
import { ImageOff, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ProductFormData, UpdateFormData } from './ProductStepForm';
import { useState } from 'react';
import { uploadPhoto, uploadMultiplePhotos } from '@/lib/uploadPhoto';
import { InlineLoading } from '../Loading';

interface Props {
  formData: ProductFormData;
  updateFormData: UpdateFormData;
}

const ImageStep = ({ formData, updateFormData }: Props) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<boolean[]>([]);
  const [isUploadingMain, setIsUploadingMain] = useState<boolean>(false);
  const [isUploadingThumbnails, setIsUploadingThumbnails] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
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
                  const availableSlots = 10 - formData.thumbnails.length;
                  const filesToUpload = fileArray.slice(0, availableSlots);
                  
                  // Create temporary URLs for immediate preview
                  const newThumbnails = [...formData.thumbnails];
                  const newErrors = [...thumbnailErrors];
                  const tempUrls: string[] = [];
                  
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
                    const finalThumbnails = [...formData.thumbnails];
                    const startIndex = formData.thumbnails.length - filesToUpload.length;
                    
                    results.forEach((result, index) => {
                      const thumbnailIndex = startIndex + index;
                      if (result.success) {
                        finalThumbnails[thumbnailIndex] = result.url;
                        // Clean up temporary URL
                        URL.revokeObjectURL(tempUrls[index]);
                      } else {
                        // Mark as error but keep the temp URL for user to see what failed
                        newErrors[thumbnailIndex] = true;
                        console.error('Thumbnail upload failed:', result.error);
                      }
                    });
                    
                    updateFormData('thumbnails', finalThumbnails);
                    setThumbnailErrors(newErrors);
                    
                  } catch (error) {
                    console.error('Thumbnails upload failed:', error);
                    // Mark all new thumbnails as errored
                    const errorThumbnails = [...thumbnailErrors];
                    for (let i = 0; i < filesToUpload.length; i++) {
                      errorThumbnails[formData.thumbnails.length - filesToUpload.length + i] = true;
                    }
                    setThumbnailErrors(errorThumbnails);
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
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {!thumbnailErrors[index] ? (
                      <Image
                        src={thumbnail}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={() => {
                          const newErrors = [...thumbnailErrors];
                          newErrors[index] = true;
                          setThumbnailErrors(newErrors);
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-2">
                        <ImageOff className="w-6 h-6 mb-1" />
                        <span className="text-xs text-center">
                          Failed to load
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

          <p className="text-sm text-gray-500">
            You can upload up to 10 additional images. Click and drag to reorder
            them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageStep;
