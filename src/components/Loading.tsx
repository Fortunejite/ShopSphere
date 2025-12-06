'use client';

import React from 'react';
import { Loader2, Package, ShoppingBag, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  /** Loading text to display */
  text?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Loading variant */
  variant?: 'spinner' | 'pulse' | 'skeleton' | 'dots' | 'shop';
  /** Whether this is a full page loading */
  fullPage?: boolean;
  /** Custom className */
  className?: string;
  /** Show loading text */
  showText?: boolean;
  /** Icon to show with spinner */
  icon?: 'default' | 'package' | 'shop' | 'bag';
}

const sizeConfig = {
  sm: {
    spinner: 'w-4 h-4',
    text: 'text-sm',
    container: 'gap-2',
    icon: 'w-4 h-4'
  },
  md: {
    spinner: 'w-6 h-6',
    text: 'text-base',
    container: 'gap-3',
    icon: 'w-6 h-6'
  },
  lg: {
    spinner: 'w-8 h-8',
    text: 'text-lg',
    container: 'gap-4',
    icon: 'w-8 h-8'
  },
  xl: {
    spinner: 'w-12 h-12',
    text: 'text-xl',
    container: 'gap-5',
    icon: 'w-12 h-12'
  }
};

const iconMap = {
  default: Loader2,
  package: Package,
  shop: Store,
  bag: ShoppingBag
};

// Spinner Loading
const SpinnerLoading: React.FC<LoadingProps> = ({
  text = 'Loading...',
  size = 'md',
  showText = true,
  icon = 'default',
  className
}) => {
  const IconComponent = iconMap[icon];
  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center justify-center', config.container, className)}>
      <IconComponent className={cn(config.spinner, 'animate-spin text-blue-600')} />
      {showText && (
        <span className={cn('text-gray-600 font-medium', config.text)}>{text}</span>
      )}
    </div>
  );
};

// Pulse Loading
const PulseLoading: React.FC<LoadingProps> = ({
  text = 'Loading...',
  size = 'md',
  showText = true,
  className
}) => {
  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center justify-center', config.container, className)}>
      <div className="flex space-x-1">
        <div className={cn(config.spinner, 'bg-blue-600 rounded-full animate-pulse')} />
        <div className={cn(config.spinner, 'bg-blue-500 rounded-full animate-pulse delay-75')} />
        <div className={cn(config.spinner, 'bg-blue-400 rounded-full animate-pulse delay-150')} />
      </div>
      {showText && (
        <span className={cn('text-gray-600 font-medium', config.text)}>{text}</span>
      )}
    </div>
  );
};

// Dots Loading
const DotsLoading: React.FC<LoadingProps> = ({
  text = 'Loading...',
  size = 'md',
  showText = true,
  className
}) => {
  const config = sizeConfig[size];
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={cn('flex items-center justify-center', config.container, className)}>
      <div className="flex space-x-1">
        <div className={cn(dotSize, 'bg-blue-600 rounded-full animate-bounce')} />
        <div className={cn(dotSize, 'bg-blue-600 rounded-full animate-bounce delay-100')} />
        <div className={cn(dotSize, 'bg-blue-600 rounded-full animate-bounce delay-200')} />
      </div>
      {showText && (
        <span className={cn('text-gray-600 font-medium', config.text)}>{text}</span>
      )}
    </div>
  );
};

// Skeleton Loading for content placeholders
const SkeletonLoading: React.FC<LoadingProps & { rows?: number; showAvatar?: boolean }> = ({
  rows = 3,
  showAvatar = false,
  className
}) => {
  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      <div className="flex items-center space-x-4">
        {showAvatar && <div className="w-12 h-12 bg-gray-300 rounded-full" />}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
        </div>
      ))}
    </div>
  );
};

// Shop-themed loading with animated shop icon
const ShopLoadingInternal: React.FC<LoadingProps> = ({
  text = 'Loading your shop...',
  size = 'md',
  showText = true,
  className
}) => {
  const config = sizeConfig[size];

  return (
    <div className={cn('flex flex-col items-center justify-center', config.container, className)}>
      <div className="relative">
        <Store className={cn(config.icon, 'text-blue-600 animate-pulse')} />
        <div className="absolute -inset-2 border-2 border-blue-300 rounded-full animate-spin opacity-30" />
      </div>
      {showText && (
        <span className={cn('text-gray-600 font-medium text-center', config.text)}>{text}</span>
      )}
    </div>
  );
};

// Main Loading Component
export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  fullPage = false,
  className,
  ...props
}) => {
  const renderLoadingContent = () => {
    switch (variant) {
      case 'pulse':
        return <PulseLoading {...props} className={className} />;
      case 'skeleton':
        return <SkeletonLoading {...props} className={className} />;
      case 'dots':
        return <DotsLoading {...props} className={className} />;
      case 'shop':
        return <ShopLoadingInternal {...props} className={className} />;
      default:
        return <SpinnerLoading {...props} className={className} />;
    }
  };

  if (fullPage) {
    return (
      <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            {renderLoadingContent()}
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full animate-loading-bar origin-left" />
            </div>
            <p className="text-xs text-gray-500">Please wait while we prepare everything for you</p>
          </div>
        </div>
      </div>
    );
  }

  return renderLoadingContent();
};

// Specialized loading components for common use cases
export const ProductLoading: React.FC<Omit<LoadingProps, 'variant' | 'icon'>> = (props) => (
  <Loading {...props} variant="spinner" icon="package" />
);

export const ShopLoading: React.FC<Omit<LoadingProps, 'variant' | 'icon'>> = (props) => (
  <Loading {...props} variant="shop" />
);

export const PageLoading: React.FC<Omit<LoadingProps, 'fullPage'>> = (props) => (
  <Loading {...props} fullPage />
);

export const InlineLoading: React.FC<LoadingProps> = (props) => (
  <Loading {...props} size="sm" showText={false} />
);

// Card Loading Skeleton
export const CardLoading: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse', className)}>
    <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-300 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded" />
        <div className="h-4 bg-gray-300 rounded w-5/6" />
        <div className="h-4 bg-gray-300 rounded w-4/6" />
      </div>
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-300 rounded w-20" />
        <div className="h-8 bg-gray-300 rounded w-16" />
      </div>
    </div>
  </div>
);

// Table Loading Skeleton
export const TableLoading: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className
}) => (
  <div className={cn('animate-pulse space-y-3', className)}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="flex-1 h-4 bg-gray-300 rounded" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="flex-1 h-4 bg-gray-200 rounded" />
        ))}
      </div>
    ))}
  </div>
);

export default Loading;
