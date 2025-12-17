import { Checkbox } from "@radix-ui/react-checkbox";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { ProductFormData, UpdateFormData } from './ProductStepForm';
import { useAppSelector } from "@/hooks/redux.hook";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

interface Props {
  formData: ProductFormData
  updateFormData: UpdateFormData
}

const PricingAndStockForm = ({ formData, updateFormData }: Props) => {
  const shop = useAppSelector(state => state.shop.shop);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ({getCurrencySymbol(shop!.currency)}) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              updateFormData('price', parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="discount">Discount (%)</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) =>
              updateFormData('discount', parseFloat(e.target.value) || 0)
            }
            placeholder="0"
            className="mt-1"
          />
        </div>
      </div>

      {formData.discount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Final Price:{' '}
            <strong>
              {formatCurrency((formData.price * (1 - formData.discount / 100)), shop!.currency)}
            </strong>{' '}
            (Save {formatCurrency((formData.price * (formData.discount / 100)), shop!.currency)})
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="stock_quantity">Stock Quantity *</Label>
        <Input
          id="stock_quantity"
          type="number"
          min="0"
          value={formData.stock_quantity}
          onChange={(e) =>
            updateFormData('stock_quantity', parseInt(e.target.value) || 0)
          }
          placeholder="0"
          className="mt-1"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_featured"
          checked={formData.is_featured}
          onCheckedChange={(checked) =>
            updateFormData('is_featured', !!checked)
          }
        />
        <Label htmlFor="is_featured">Feature this product</Label>
      </div>
    </div>
  );
};
 export default PricingAndStockForm;