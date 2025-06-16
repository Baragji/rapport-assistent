import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import performanceMonitor from '../utils/performanceMonitor';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  fid: number | null;
  ttfb: number | null;
}

interface UsePerformanceOptions {
  trackPageLoad?: boolean;
  trackInteractions?: boolean;
  trackMemory?: boolean;
  trackNetworkRequests?: boolean;
  reportInterval?: number; // ms
}

/**
 * Hook for monitoring performance metrics in React components
 */
export function usePerformanceMonitor(
  componentName: string,
  options: UsePerformanceOptions = {}
) {
  const {
    trackPageLoad = true,
    trackInteractions = true,
    trackMemory = false,
    trackNetworkRequests = false,
    reportInterval = 30000, // 30 seconds
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
  });

  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const interactionCount = useRef(0);
  const renderCount = useRef(0);

  // Track component render
  useEffect(() => {
    renderCount.current += 1;
    performanceMonitor.startMetric(`${componentName}-render-${renderCount.current}`);

    return () => {
      const duration = performanceMonitor.endMetric(`${componentName}-render-${renderCount.current}`);
      if (duration && duration > 50) {
        console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
      }
    };
  });

  // Track web vitals if enabled
  useEffect(() => {
    if (!trackPageLoad) return undefined;

    // Track First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const fcp = entries[0].startTime;
        setMetrics(prev => ({ ...prev, fcp }));
      }
    });

    // Track Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const lcp = entries[entries.length - 1].startTime;
        setMetrics(prev => ({ ...prev, lcp }));
      }
    });

    // Track Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        // Layout shift entries have hadRecentInput and value properties
        // @ts-expect-error - PerformanceEntry types don't include these properties
        if (!entry.hadRecentInput) {
          // @ts-expect-error - PerformanceEntry types don't include value
          clsValue += entry.value;
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    // Track First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        // @ts-expect-error - PerformanceEntry types don't include processingStart and startTime
        const fid = entries[0].processingStart - entries[0].startTime;
        setMetrics(prev => ({ ...prev, fid }));
      }
    });

    // Track Time to First Byte
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      // @ts-expect-error - PerformanceEntry types don't include responseStart and requestStart
      const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
      setMetrics(prev => ({ ...prev, ttfb }));
    }

    try {
      fcpObserver.observe({ type: 'paint', buffered: true });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.warn('Performance observer not supported', error);
    }

    return () => {
      try {
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        clsObserver.disconnect();
        fidObserver.disconnect();
      } catch {
        // Ignore errors on cleanup
      }
    };
  }, [trackPageLoad, componentName]);

  // Track memory usage if enabled
  useEffect(() => {
    if (!trackMemory) return undefined;

    const checkMemory = () => {
      // @ts-expect-error - performance.memory is not in the standard types
      if (performance.memory) {
        // @ts-expect-error - performance.memory is not in the standard types
        setMemoryUsage(performance.memory.usedJSHeapSize / (1024 * 1024));
      }
    };

    checkMemory();
    const intervalId = setInterval(checkMemory, reportInterval);

    return () => clearInterval(intervalId);
  }, [trackMemory, reportInterval]);

  // Track network requests if enabled
  useEffect(() => {
    if (!trackNetworkRequests) return undefined;

    const requestObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === 'resource') {
          // Resource entries have additional properties
          // @ts-expect-error - PerformanceEntry types don't include these properties
          const initiatorType = entry.initiatorType || 'unknown';
          // @ts-expect-error - PerformanceEntry types don't include these properties
          const transferSize = entry.transferSize || 0;
          
          performanceMonitor.startMetric(`network-${entry.name}`, {
            type: initiatorType,
            size: transferSize,
          });
          
          // @ts-expect-error - PerformanceEntry types don't include responseEnd and startTime
          const duration = entry.responseEnd - entry.startTime;
          if (duration > 1000) {
            console.warn(`Slow network request: ${entry.name} took ${duration.toFixed(2)}ms`);
          }
        }
      }
    });

    try {
      requestObserver.observe({ type: 'resource', buffered: true });
    } catch (error) {
      console.warn('Resource observer not supported', error);
    }

    return () => {
      try {
        requestObserver.disconnect();
      } catch {
        // Ignore errors on cleanup
      }
    };
  }, [trackNetworkRequests]);

  // Track user interactions if enabled
  useEffect(() => {
    if (!trackInteractions) return undefined;

    const trackInteraction = (event: Event) => {
      interactionCount.current += 1;
      const target = event.target as HTMLElement;
      const targetType = target.tagName?.toLowerCase() || 'unknown';
      const targetId = target.id || 'unknown';
      
      performanceMonitor.startMetric(`${componentName}-interaction-${interactionCount.current}`, {
        type: event.type,
        target: targetType,
        id: targetId,
      });
      
      // End the metric after a short delay to capture the full interaction
      setTimeout(() => {
        performanceMonitor.endMetric(`${componentName}-interaction-${interactionCount.current}`);
      }, 100);
    };

    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
    };
  }, [trackInteractions, componentName]);

  // Export metrics for component
  const getComponentMetrics = useCallback(() => {
    return {
      componentName,
      renderCount: renderCount.current,
      interactionCount: interactionCount.current,
      webVitals: metrics,
      memoryUsage,
      timestamp: Date.now(),
    };
  }, [componentName, metrics, memoryUsage]);

  return {
    metrics,
    memoryUsage,
    getComponentMetrics,
  };
}

interface InViewOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

/**
 * Hook to detect when an element is in the viewport
 * Used for lazy loading components and performance optimization
 */
export function useInView(options: InViewOptions = {}): [RefObject<HTMLDivElement>, boolean] {
  const { 
    root = null, 
    rootMargin = '0px', 
    threshold = 0,
    triggerOnce = false 
  } = options;
  
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const enteredView = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isVisible = entry.isIntersecting;
        
        if (isVisible) {
          setInView(true);
          enteredView.current = true;
          
          // If triggerOnce is true, disconnect the observer after the element enters the viewport
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce || !enteredView.current) {
          setInView(false);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold, triggerOnce]);

  // Type assertion to ensure the ref is treated as a RefObject<HTMLDivElement>
  return [ref as RefObject<HTMLDivElement>, inView];
}

export default usePerformanceMonitor;