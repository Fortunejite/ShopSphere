import { Plus, ShieldCheck, Star, X } from 'lucide-react';
import { ProductVariant } from '@/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ProductFormData, UpdateFormData } from './ProductStepForm';

interface Props {
  formData: ProductFormData;
  updateFormData: UpdateFormData;
}

const Variants = ({ formData, updateFormData }: Props) => {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-background/60 p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Product variants</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create options like size, color, material, or bundle type.
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            {formData.variants.length} variant{formData.variants.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Variant List
        </h4>
        <Button
          type="button"
          variant="default"
          onClick={() => {
            const newVariant: ProductVariant = {
              attributes: {},
              is_default: formData.variants.length === 0,
            };
            updateFormData('variants', [...formData.variants, newVariant]);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Variant
        </Button>
      </div>

      {formData.variants.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-xl bg-muted/20">
          <p className="mb-2">No variants added yet.</p>
          <p className="text-sm">
            Variants allow you to sell the same product with different options
            like size, color, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {formData.variants.map((variant, index) => (
            <div key={index} className="border rounded-xl p-5 space-y-4 bg-background/50">
              <div className="flex justify-between items-center">
                <h5 className="font-semibold">Variant {index + 1}</h5>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updatedVariants = [...formData.variants];
                      updatedVariants[index] = {
                        ...updatedVariants[index],
                        is_default: true,
                      };
                      // Set all others to false
                      updatedVariants.forEach((v, i) => {
                        if (i !== index) v.is_default = false;
                      });
                      updateFormData('variants', updatedVariants);
                    }}
                    className={variant.is_default ? 'bg-primary/10 border-primary/30 text-primary' : ''}
                  >
                    {variant.is_default ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" /> Default
                      </span>
                    ) : (
                      'Set as Default'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newVariants = formData.variants.filter(
                        (_, i) => i !== index,
                      );
                      // If we deleted the default variant, make the first one default
                      if (variant.is_default && newVariants.length > 0) {
                        newVariants[0].is_default = true;
                      }
                      updateFormData('variants', newVariants);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Attributes (e.g. color: Red, size: Large)</Label>
                <div className="space-y-2">
                    {Object.entries(variant.attributes).map(
                      ([key, value], attrIndex) => (
                        <div key={attrIndex} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                          <Input
                            placeholder="Attribute (e.g., color)"
                            value={key}
                            onChange={(e) => {
                              const updatedVariants = [...formData.variants];
                              const newAttributes = { ...variant.attributes };
                              delete newAttributes[key];
                              newAttributes[e.target.value.toLowerCase()] = value;
                              updatedVariants[index] = {
                                ...variant,
                                attributes: newAttributes,
                              };
                              updateFormData('variants', updatedVariants);
                            }}
                          />
                          <Input
                            placeholder="Value (e.g., Red)"
                            value={value}
                            onChange={(e) => {
                              const updatedVariants = [...formData.variants];
                              const newAttributes = { ...variant.attributes };
                              newAttributes[key] = e.target.value;
                              updatedVariants[index] = {
                                ...variant,
                                attributes: newAttributes,
                              };
                              updateFormData('variants', updatedVariants);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedVariants = [...formData.variants];
                              const newAttributes = { ...variant.attributes };
                              delete newAttributes[key];
                              updatedVariants[index] = {
                                ...variant,
                                attributes: newAttributes,
                              };
                              updateFormData('variants', updatedVariants);
                            }}
                            className="md:w-10"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ),
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedVariants = [...formData.variants];
                        const newAttributes = { ...variant.attributes };
                        newAttributes[
                          `Attribute ${Object.keys(newAttributes).length + 1}`
                        ] = '';
                        updatedVariants[index] = {
                          ...variant,
                          attributes: newAttributes,
                        };
                        updateFormData('variants', updatedVariants);
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Attribute
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <p className="text-sm text-primary/80">
          <strong className="inline-flex items-center gap-1.5 mr-1">
            <ShieldCheck className="w-4 h-4" /> Note:
          </strong>
          Variants are optional. If you don&apos;t add variants, the base price and
          stock from Step 2 will be used. One variant must be marked as default
          if you add any variants.
        </p>
      </div>
    </div>
  );
};

export default Variants;
