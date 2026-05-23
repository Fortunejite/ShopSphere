import { Star } from 'lucide-react';
import { useAppSelector } from '@/hooks/redux.hook';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ProductFormData, UpdateFormData } from './ProductStepForm';

interface Props {
  formData: ProductFormData;
  updateFormData: UpdateFormData;
}

const PricingAndStockForm = ({ formData, updateFormData }: Props) => {
  const shop = useAppSelector(state => state.shop.shop);
  const currency = shop?.currency ?? 'NGN';
  const basePrice = Number(formData.price || 0);
  const discountAmount = basePrice * (Number(formData.discount || 0) / 100);
  const finalPrice = Math.max(basePrice - discountAmount, 0);

  return (
    <div className="space-y-8">
      <section className="space-y-5 pb-6 border-b border-border/60">
        <div>
          <h3 className="text-base font-semibold text-foreground">Pricing</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Set a clear base price and optional discount.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Base Price ({getCurrencySymbol(currency)}) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={(e) => updateFormData('discount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Base price</span>
            <span className="font-medium">{formatCurrency(basePrice, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium">-{formatCurrency(discountAmount, currency)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Final selling price</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(finalPrice, currency)}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Inventory</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track availability and boost visibility with featured placement.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Stock Quantity *</Label>
          <Input
            id="stock_quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => updateFormData('stock_quantity', parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="h-11"
          />
        </div>

        <label
          htmlFor="is_featured"
          className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-4 cursor-pointer"
        >
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              Feature this product
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Featured products can appear in highlighted storefront sections.
            </p>
          </div>
          <Checkbox
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) => updateFormData('is_featured', !!checked)}
          />
        </label>
      </section>
    </div>
  );
};

export default PricingAndStockForm;