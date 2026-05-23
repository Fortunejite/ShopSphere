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
  Truck,
  Grid3X3,
  AlertCircle,
  Loader2,
  Check,
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
import { ProductVariant } from '@/types';

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
  { id: 1, title: 'Basic Info', description: 'Product details', icon: Package },
  { id: 2, title: 'Pricing', description: 'Price & stock', icon: DollarSign },
  { id: 3, title: 'Variants', description: 'Options & SKUs', icon: Grid3X3 },
  { id: 4, title: 'Images', description: 'Photos', icon: ImageIcon },
  { id: 5, title: 'Shipping', description: 'Weight & dimensions', icon: Truck },
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
  const [isImageUploading, setIsImageUploading] = useState(false);

  const categories = useAppSelector(state => state.category.categories);

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
    // Prevent navigation if images are uploading
    if (currentStep === 4 && isImageUploading) {
      return;
    }
    
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
          <ImageStep 
            formData={formData} 
            updateFormData={updateFormData}
            onUploadStateChange={setIsImageUploading}
          />
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
    <div className="w-full max-w-6xl mx-auto">
      {/* Main Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Steps Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-xl p-4 lg:sticky lg:top-6 space-y-2">
            <h3 className="text-sm font-bold text-foreground mb-4">Progress</h3>
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`
                    w-full text-left px-3 py-3 rounded-lg transition-all duration-200
                    flex items-start gap-3 border
                    ${
                      isActive
                        ? 'bg-primary/10 border-primary text-primary'
                        : isCompleted
                        ? 'bg-success/10 border-success text-success hover:bg-success/15'
                        : 'bg-muted/50 border-transparent hover:bg-muted'
                    }
                  `}
                >
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {step.id}
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground">
                        {step.id}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Step Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon;
                return <StepIcon className="w-6 h-6 text-primary" />;
              })()}
              <h1 className="text-2xl font-bold text-foreground">
                {steps[currentStep - 1].title}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep - 1].description} • Step {currentStep} of {steps.length}
            </p>
          </div>

          {/* Step Error */}
          {stepErrors[currentStep] && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{stepErrors[currentStep]}</AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          <div className="bg-card border rounded-xl p-6 md:p-8 mb-8">
            <div className="w-full">{renderStep()}</div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="text-xs text-muted-foreground">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep < steps.length ? (
              <Button 
                type="button" 
                onClick={handleNext} 
                disabled={isValidating || (currentStep === 4 && isImageUploading)}
                className="gap-2"
              >
                <span className="hidden sm:inline">Next</span>
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentStep === 4 && isImageUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">{submitLabel}</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
