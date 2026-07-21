import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, X } from 'lucide-react';
import { ProductFormData, UpdateFormData } from './ProductStepForm';

interface Props {
  formData: ProductFormData;
  updateFormData: UpdateFormData;
  categories: { id: number; name: string }[];
  isEdit?: boolean;
}

const BasicInfoStep = ({ formData, updateFormData, categories }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [categories, searchTerm]);

  return (
    <div className="space-y-8">
      <section className="space-y-4 pb-6 border-b border-border/60">
        <div>
          <h3 className="text-base font-semibold text-foreground">Product details</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add the core information customers see first.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            placeholder="e.g. Premium Cotton Hoodie"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="Describe your product, materials, fit, highlights, and what makes it unique..."
            rows={6}
            className="resize-y"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Categorization</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose one or more categories to help customers discover this product.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-search">Search categories</Label>
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="category-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by category name"
              className="pl-9 h-11"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto border rounded-lg p-3 bg-muted/30">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const isChecked = formData.category_ids.includes(category.id);
              return (
                <label
                  key={category.id}
                  htmlFor={`category-${category.id}`}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/10 cursor-pointer"
                >
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData('category_ids', [
                          ...formData.category_ids,
                          category.id,
                        ]);
                        return;
                      }

                      updateFormData(
                        'category_ids',
                        formData.category_ids.filter((id) => id !== category.id),
                      );
                    }}
                  />
                  <span className="text-sm text-foreground">{category.name}</span>
                </label>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No categories match your search
            </div>
          )}
        </div>

        {formData.category_ids.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium text-foreground mb-2">
              Selected ({formData.category_ids.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.category_ids.map((id) => {
                const category = categories.find((c) => c.id === id);
                if (!category) return null;

                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1.5 text-xs pr-1"
                  >
                    <span>{category.name}</span>
                    <button
                      type="button"
                      className="w-5 h-5 grid place-items-center rounded hover:bg-muted-foreground/15"
                      onClick={() =>
                        updateFormData(
                          'category_ids',
                          formData.category_ids.filter((cId) => cId !== id),
                        )
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default BasicInfoStep;
