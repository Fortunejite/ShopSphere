'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  Image as ImageIcon,
  Settings,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { z } from 'zod';
import {
  basicInfoSchema,
  mediaSchema,
  pricingSchema,
  shippingSchema,
  variantsSchema,
} from '@/lib/schema/product';
import BasicInfoStep from './BasicInfoStep';
import PricingAndStockForm from './PriceStep';
import Variants from './VariantStep';
import ImageStep from './ImageStep';
import ShippingStep from './ShippingStep';
import { useAppSelector } from '@/hooks/redux.hook';
import { ProductVariant } from '@/models/Product';

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  image: string;
  thumbnails: string[];
  stock_quantity: number;
  is_featured: boolean;
  category_ids: number[];
  variants: ProductVariant[];
  status: 'active' | 'inactive' | 'out_of_stock';
  weight: number;
  length: number;
  width: number;
  height: number;
}

export type UpdateFormData = <K extends keyof ProductFormData>(
  field: K,
  value: ProductFormData[K],
) => void;

interface ProductStepFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  initialData?: Partial<ProductFormData>;
  error?: string;
  isEdit?: boolean;
}

const steps = [
  { id: 1, title: 'Basic Information', icon: Package },
  { id: 2, title: 'Pricing & Stock', icon: DollarSign },
  { id: 3, title: 'Variants', icon: Settings },
  { id: 4, title: 'Images', icon: ImageIcon },
  { id: 5, title: 'Shipping', icon: Settings },
];

export default function ProductStepForm({
  onSubmit,
  submitLabel = 'Save Product',
  isSubmitting = false,
  initialData,
  error,
  isEdit = false,
}: ProductStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    discount: 0,
    image: '',
    thumbnails: [],
    stock_quantity: 0,
    is_featured: false,
    category_ids: [],
    variants: [],
    status: 'active',
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    ...initialData,
  });

  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const categoriesState = useAppSelector(state => state.category.categories);
  const shop = useAppSelector(state => state.shop.shop);
  const categories = categoriesState.filter(cat => cat.parent_id === shop!.category_id);

  const updateFormData = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear step error when user starts typing
    if (stepErrors[currentStep]) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: '' }));
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    setIsValidating(true);
    setStepErrors((prev) => ({ ...prev, [step]: '' }));

    try {
      switch (step) {
        case 1:
          basicInfoSchema.parse({
            name: formData.name,
            description: formData.description,
            category_ids: formData.category_ids,
          });
          break;
        case 2:
          pricingSchema.parse({
            price: formData.price,
            discount: formData.discount,
            stock_quantity: formData.stock_quantity,
            is_featured: formData.is_featured,
          });
          break;
        case 3:
          variantsSchema.parse({
            variants: formData.variants,
          });
          break;
        case 4:
          mediaSchema.parse({
            image: formData.image,
            thumbnails: formData.thumbnails,
          });
          break;
        case 5:
          shippingSchema.parse({
            weight: formData.weight,
            length: formData.length,
            width: formData.width,
            height: formData.height,
          });
          break;
        default:
          return false;
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0];
        setStepErrors((prev) => ({ ...prev, [step]: firstError.message }));
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    let allValid = true;
    for (let i = 1; i <= steps.length; i++) {
      const isValid = await validateStep(i);
      if (!isValid) {
        allValid = false;
        setCurrentStep(i); // Jump to first invalid step
        break;
      }
    }

    if (allValid) {
      await onSubmit(formData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            updateFormData={updateFormData}
            categories={categories}
            isEdit={isEdit}
          />
        );

      case 2:
        return (
          <PricingAndStockForm
            formData={formData}
            updateFormData={updateFormData}
          />
        );

      case 3:
        return <Variants formData={formData} updateFormData={updateFormData} />;

      case 4:
        return (
          <ImageStep formData={formData} updateFormData={updateFormData} />
        );

      case 5:
        return (
          <ShippingStep formData={formData} updateFormData={updateFormData} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-none overflow-hidden">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors
                ${
                  isActive
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }
              `}
              >
                <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {/* Hidden step title on mobile, visible on larger screens */}
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                  w-8 sm:w-12 lg:w-16 h-px mx-2 sm:mx-4 
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Display */}
      {(error || stepErrors[currentStep]) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || stepErrors[currentStep]}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border w-full overflow-hidden">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[currentStep - 1].title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Step {currentStep} of {steps.length}
          </p>
        </div>

        <div className="w-full overflow-hidden">{renderStep()}</div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button type="button" onClick={handleNext} disabled={isValidating}>
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
