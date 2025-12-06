// Example usage of Loading components
// This file demonstrates how to use the various loading components in your Shop Sphere project

import { 
  Loading, 
  ProductLoading, 
  ShopLoading, 
  PageLoading, 
  InlineLoading, 
  CardLoading, 
  TableLoading 
} from '@/components/Loading';

// Example 1: Full page loading (for pages with Suspense)
export const FullPageExample = () => (
  <PageLoading text="Loading your dashboard..." variant="shop" />
);

// Example 2: Product-specific loading
export const ProductListExample = () => (
  <div className="p-6">
    <ProductLoading text="Loading products..." size="lg" />
  </div>
);

// Example 3: Shop-specific loading
export const ShopExample = () => (
  <ShopLoading text="Setting up your shop..." size="md" />
);

// Example 4: Inline loading for buttons or small areas
export const InlineExample = () => (
  <div className="flex items-center gap-2">
    <span>Processing</span>
    <InlineLoading />
  </div>
);

// Example 5: Card skeleton loading
export const CardSkeletonExample = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <CardLoading />
    <CardLoading />
    <CardLoading />
  </div>
);

// Example 6: Table skeleton loading
export const TableSkeletonExample = () => (
  <div className="p-4">
    <TableLoading rows={5} columns={4} />
  </div>
);

// Example 7: Different variants
export const VariantExamples = () => (
  <div className="space-y-8 p-6">
    <div>
      <h3 className="text-lg font-semibold mb-4">Spinner Variants</h3>
      <div className="grid grid-cols-2 gap-4">
        <Loading variant="spinner" text="Default spinner" />
        <Loading variant="spinner" icon="package" text="Package spinner" />
        <Loading variant="spinner" icon="shop" text="Shop spinner" />
        <Loading variant="spinner" icon="bag" text="Bag spinner" />
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-semibold mb-4">Other Variants</h3>
      <div className="grid grid-cols-2 gap-4">
        <Loading variant="pulse" text="Pulse animation" />
        <Loading variant="dots" text="Bouncing dots" />
        <Loading variant="shop" text="Shop themed" />
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-semibold mb-4">Different Sizes</h3>
      <div className="grid grid-cols-4 gap-4">
        <Loading size="sm" text="Small" />
        <Loading size="md" text="Medium" />
        <Loading size="lg" text="Large" />
        <Loading size="xl" text="Extra Large" />
      </div>
    </div>
  </div>
);

// Example usage in your components:

/*
// For product pages:
if (isLoading) {
  return <ProductLoading text="Loading product details..." />;
}

// For shop setup:
if (isLoading) {
  return <ShopLoading text="Setting up your shop..." />;
}

// For full page loading with Suspense:
<Suspense fallback={<PageLoading text="Loading..." />}>
  <YourComponent />
</Suspense>

// For inline loading in buttons:
<button disabled={isLoading}>
  {isLoading ? <InlineLoading /> : 'Submit'}
</button>

// For loading cards while fetching data:
{isLoading ? (
  <div className="grid grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <CardLoading key={i} />
    ))}
  </div>
) : (
  // Your actual cards
)}

// For loading tables:
{isLoading ? (
  <TableLoading rows={10} columns={5} />
) : (
  // Your actual table
)}
*/
