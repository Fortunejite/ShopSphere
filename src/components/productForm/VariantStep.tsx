import { ProductVariant } from "@/models/Product";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ProductFormData, UpdateFormData } from './ProductStepForm';
import { getCurrencySymbol } from "@/lib/currency";
import { useAppSelector } from "@/hooks/redux.hook";

interface Props {
  formData: ProductFormData
  updateFormData: UpdateFormData
}

const Variants = ({ formData, updateFormData }: Props) => {
  const shop = useAppSelector(state => state.shop.shop);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium">Product Variants</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const newVariant: ProductVariant = {
              attributes: {},
              price: formData.price,
              discount: formData.discount,
              stock_quantity: formData.stock_quantity,
              is_default: formData.variants.length === 0,
            };
            updateFormData('variants', [...formData.variants, newVariant]);
          }}
        >
          Add Variant
        </Button>
      </div>

      {formData.variants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No variants added yet.</p>
          <p className="text-sm">
            Variants allow you to sell the same product with different options
            like size, color, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.variants.map((variant, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-medium">Variant {index + 1}</h5>
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
                    className={
                      variant.is_default ? 'bg-blue-100 border-blue-300' : ''
                    }
                  >
                    {variant.is_default ? 'Default' : 'Set as Default'}
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
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Attributes (e.g., color: Red, size: Large)</Label>
                  <div className="space-y-2 mt-1">
                    {Object.entries(variant.attributes).map(
                      ([key, value], attrIndex) => (
                        <div key={attrIndex} className="flex gap-2">
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
                    >
                      Add Attribute
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Price ({getCurrencySymbol(shop!.currency)})</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.price}
                      onChange={(e) => {
                        const updatedVariants = [...formData.variants];
                        updatedVariants[index] = {
                          ...variant,
                          price: parseFloat(e.target.value) || 0,
                        };
                        updateFormData('variants', updatedVariants);
                      }}
                    />
                  </div>

                  <div>
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={variant.discount}
                      onChange={(e) => {
                        const updatedVariants = [...formData.variants];
                        updatedVariants[index] = {
                          ...variant,
                          discount: parseFloat(e.target.value) || 0,
                        };
                        updateFormData('variants', updatedVariants);
                      }}
                    />
                  </div>

                  <div>
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={variant.stock_quantity}
                      onChange={(e) => {
                        const updatedVariants = [...formData.variants];
                        updatedVariants[index] = {
                          ...variant,
                          stock_quantity: parseInt(e.target.value) || 0,
                        };
                        updateFormData('variants', updatedVariants);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Variants are optional. If you don&apos;t add
          variants, the base price and stock from Step 2 will be used. One
          variant must be marked as default if you add any variants.
        </p>
      </div>
    </div>
  );
};

export default Variants;
