/**
 * Performance utilities for optimizing application performance
 */

import performanceMonitor from './performanceMonitor';

interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * Debounce a function to limit how often it can be called
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @param options Options for the debounce behavior
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait = 100,
  options: DebounceOptions = {}
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: ReturnType<T>;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  const { leading = false, trailing = true, maxWait } = options;
  const maxWaitTime = maxWait !== undefined ? Math.max(maxWait, wait) : undefined;

  function invokeFunc(time: number) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args as Parameters<T>) as ReturnType<T>;
    return result;
  }

  function startTimer(pendingFunc: () => void, wait: number) {
    return setTimeout(pendingFunc, wait);
  }

  function cancelTimer(id: ReturnType<typeof setTimeout>) {
    clearTimeout(id);
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeout = startTimer(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - (lastCallTime as number);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWaitTime !== undefined
      ? Math.min(timeWaiting, maxWaitTime - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - (lastCallTime as number);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWaitTime !== undefined && timeSinceLastInvoke >= maxWaitTime)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = startTimer(timerExpired, remainingWait(time));
    return undefined;
  }

  function trailingEdge(time: number) {
    timeout = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timeout !== undefined) {
      cancelTimer(timeout);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeout = undefined;
  }

  function flush() {
    return timeout === undefined ? result : trailingEdge(Date.now());
  }

  function pending() {
    return timeout !== undefined;
  }

  function debounced(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisArg = this;

    lastArgs = args;
    lastThis = thisArg;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWaitTime !== undefined) {
        timeout = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeout === undefined) {
      timeout = startTimer(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced;
}

/**
 * Throttle a function to limit how often it can be called
 * @param func The function to throttle
 * @param wait The time to wait in milliseconds
 * @param options Options for the throttle behavior
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait = 100,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return debounce(func, wait, {
    leading: options.leading !== false,
    trailing: options.trailing !== false,
    maxWait: wait,
  });
}

/**
 * Memoize a function to cache its results
 * @param func The function to memoize
 * @param resolver Optional function to resolve the cache key
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => ReturnType<T> {
  const memoized = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver.apply(this, args) : String(args[0]);
    const cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result = func.apply(this, args) as ReturnType<T>;
    memoized.cache = cache.set(key, result);
    return result;
  };

  memoized.cache = new Map();
  return memoized;
}

/**
 * Measure the execution time of a function
 * @param func The function to measure
 * @param name Optional name for the measurement
 */
export function measureExecutionTime<T extends (...args: unknown[]) => unknown>(
  func: T,
  name = 'function'
): (...args: Parameters<T>) => ReturnType<T> {
  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    performanceMonitor.startMetric(name);
    const result = func.apply(this, args) as ReturnType<T>;
    performanceMonitor.endMetric(name);
    return result;
  };
}

/**
 * Check if the browser supports the Intersection Observer API
 */
export function supportsIntersectionObserver(): boolean {
  return 'IntersectionObserver' in window && 'IntersectionObserverEntry' in window;
}

/**
 * Check if the browser supports the Performance Observer API
 */
export function supportsPerformanceObserver(): boolean {
  return 'PerformanceObserver' in window;
}

/**
 * Check if the browser is in a reduced data usage mode
 */
export function isDataSaverEnabled(): boolean {
  // @ts-expect-error - navigator.connection is not in the standard types
  return navigator.connection && navigator.connection.saveData === true;
}

/**
 * Check if the browser prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get the effective connection type if available
 */
export function getConnectionType(): string {
  // @ts-expect-error - navigator.connection is not in the standard types
  if (navigator.connection && navigator.connection.effectiveType) {
    // @ts-expect-error - navigator.connection is not in the standard types
    return navigator.connection.effectiveType;
  }
  return 'unknown';
}

/**
 * Optimize image loading based on connection speed
 * @param imageUrl The original image URL
 * @param options Options for image optimization
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  options: { width?: number; quality?: number } = {}
): string {
  const connectionType = getConnectionType();
  const { width = 800, quality = 80 } = options;
  
  // Adjust quality based on connection type
  let adjustedQuality = quality;
  if (connectionType === '2g' || connectionType === 'slow-2g') {
    adjustedQuality = 60;
  } else if (connectionType === '3g') {
    adjustedQuality = 70;
  }
  
  // If the URL is already using an image CDN or service, append parameters
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl.replace(/\/upload\//, `/upload/q_${adjustedQuality},w_${width}/`);
  }
  
  if (imageUrl.includes('imgix.net')) {
    return `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}w=${width}&q=${adjustedQuality}`;
  }
  
  // For other URLs, just return the original
  return imageUrl;
}

export default {
  debounce,
  throttle,
  memoize,
  measureExecutionTime,
  supportsIntersectionObserver,
  supportsPerformanceObserver,
  isDataSaverEnabled,
  prefersReducedMotion,
  getConnectionType,
  getOptimizedImageUrl,
};