import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { ProductFormData, UpdateFormData } from './ProductStepForm';

interface Props {
  formData: ProductFormData;
  updateFormData: UpdateFormData;
  categories: { id: number; name: string }[];
  isEdit?: boolean;
}

const BasicInfoStep = ({ formData, updateFormData, categories }: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Enter product name"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe your product..."
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Categories *</Label>
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-muted">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={formData.category_ids.includes(category.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData('category_ids', [
                        ...formData.category_ids,
                        category.id,
                      ]);
                    } else {
                      updateFormData(
                        'category_ids',
                        formData.category_ids.filter(
                          (id) => id !== category.id,
                        ),
                      );
                    }
                  }}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {category.name}
                </Label>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No categories available
            </div>
          )}
        </div>

        {/* Selected categories display */}
        {formData.category_ids.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-foreground mb-2">
              Selected Categories ({formData.category_ids.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.category_ids.map((id) => {
                const category = categories.find((c) => c.id === id);
                return category ? (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    <span>{category.name}</span>
                    <button
                      className="w-3 h-3 cursor-pointer hover:text-error ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFormData(
                          'category_ids',
                          formData.category_ids.filter((cId) => cId !== id),
                        );
                      }}
                    >
                      <X className='w-3 h-3'/>
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoStep;
