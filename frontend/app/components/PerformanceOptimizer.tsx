"use client";

import { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';

// Loading component with skeleton
const SkeletonLoader = ({ className = "h-64" }: { className?: string }) => (
  <div className={`bg-zinc-800 rounded-lg animate-pulse ${className}`}>
    <div className="h-full bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-size-200 animate-shimmer"></div>
  </div>
);

// Error boundary for lazy components
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
    <h3 className="text-red-400 font-semibold mb-2">Component Error</h3>
    <p className="text-gray-300 text-sm">{error.message}</p>
  </div>
);

// Lazy load wrapper with error boundary
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <SkeletonLoader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Performance optimized chart wrapper
export const OptimizedChart = ({ 
  children, 
  loading = false,
  error = null 
}: { 
  children: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
}) => {
  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const [ref, setRef] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, options);

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, callback, options]);

  return setRef;
};

// Debounced hook for performance
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized component wrapper
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, propsAreEqual);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) {
        console.warn(`${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  }, [componentName]);
};

export default PerformanceOptimizer; 