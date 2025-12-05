import { Label } from '@radix-ui/react-label';
import { Input } from '../ui/input';
import { ProductFormData, UpdateFormData } from './ProductStepForm';

interface Props {
  formData: ProductFormData
  updateFormData: UpdateFormData
}

const ShippingStep = ({ formData, updateFormData }: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.01"
          min="0"
          value={formData.weight}
          onChange={(e) =>
            updateFormData('weight', parseFloat(e.target.value) || 0)
          }
          placeholder="0.00"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Dimensions (cm)</Label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <Label htmlFor="length" className="text-sm text-neutral-600">
              Length
            </Label>
            <Input
              id="length"
              type="number"
              step="0.1"
              min="0"
              value={formData.length}
              onChange={(e) =>
                updateFormData('length', parseFloat(e.target.value) || 0)
              }
              placeholder="0.0"
            />
          </div>
          <div>
            <Label htmlFor="width" className="text-sm text-neutral-600">
              Width
            </Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              min="0"
              value={formData.width}
              onChange={(e) =>
                updateFormData('width', parseFloat(e.target.value) || 0)
              }
              placeholder="0.0"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-sm text-neutral-600">
              Height
            </Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0"
              value={formData.height}
              onChange={(e) =>
                updateFormData('height', parseFloat(e.target.value) || 0)
              }
              placeholder="0.0"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Shipping Information</h4>
        <p className="text-sm text-blue-800">
          These dimensions and weight will be used to calculate shipping costs
          for your customers. Make sure they are accurate to provide the best
          shipping experience.
        </p>
      </div>
    </div>
  );
};

export default ShippingStep;
