import { Info } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ProductFormData, UpdateFormData } from './ProductStepForm';

interface Props {
  formData: ProductFormData;
  updateFormData: UpdateFormData;
}

const ShippingStep = ({ formData, updateFormData }: Props) => {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-background/60 p-5 md:p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Package details</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Accurate package data helps calculate reliable shipping rates.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.01"
            min="0"
            value={formData.weight}
            onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="h-11"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-background/60 p-5 md:p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Dimensions (cm)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the packaged length, width, and height.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="length" className="text-sm">Length</Label>
            <Input
              id="length"
              type="number"
              step="0.1"
              min="0"
              value={formData.length}
              onChange={(e) => updateFormData('length', parseFloat(e.target.value) || 0)}
              placeholder="0.0"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="width" className="text-sm">Width</Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              min="0"
              value={formData.width}
              onChange={(e) => updateFormData('width', parseFloat(e.target.value) || 0)}
              placeholder="0.0"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm">Height</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0"
              value={formData.height}
              onChange={(e) => updateFormData('height', parseFloat(e.target.value) || 0)}
              placeholder="0.0"
              className="h-11"
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-info/25 bg-info/10 p-4">
        <Info className="w-4 h-4 text-info mt-0.5" />
        <p className="text-sm text-primary/80">
          These dimensions and weight will be used to calculate shipping costs
          for your customers. Make sure they are accurate to provide the best
          shipping experience.
        </p>
      </div>
    </div>
  );
};

export default ShippingStep;
