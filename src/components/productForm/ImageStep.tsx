import Image from 'next/image';
import { Label } from '@radix-ui/react-label';
import { ImageOff, Upload, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ProductFormData, UpdateFormData } from './ProductStepForm';
import { useState } from 'react';

interface Props {
  formData: ProductFormData;
  updateFormData: UpdateFormData;
}

const ImageStep = ({ formData, updateFormData }: Props) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<boolean[]>([]);
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Create a temporary URL for preview
                  const tempUrl = URL.createObjectURL(file);
                  updateFormData('image', tempUrl);
                  setImageError(false);
                  // In a real app, you'd upload to a server here
                  // and get back a permanent URL
                }
              }}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Upload an image file (JPG, PNG, GIF, etc.)
            </p>
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
                      onClick={() => updateFormData('image', '')}
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
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  const newThumbnails = [...formData.thumbnails];
                  const newErrors = [...thumbnailErrors];

                  Array.from(files).forEach((file) => {
                    const tempUrl = URL.createObjectURL(file);
                    newThumbnails.push(tempUrl);
                    newErrors.push(false);
                  });

                  // Limit to 10 thumbnails
                  if (newThumbnails.length > 10) {
                    newThumbnails.splice(10);
                    newErrors.splice(10);
                  }

                  updateFormData('thumbnails', newThumbnails);
                  setThumbnailErrors(newErrors);
                }
              };
              input.click();
            }}
            disabled={formData.thumbnails.length >= 10}
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            {formData.thumbnails.length === 0
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
