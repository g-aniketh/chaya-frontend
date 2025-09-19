"use client";

import { useEffect, useRef, useState } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkRequests: number;
  errors: number;
}

interface PerformanceConfig {
  enableMemoryTracking?: boolean;
  enableNetworkTracking?: boolean;
  enableErrorTracking?: boolean;
  sampleRate?: number; // 0-1, percentage of sessions to track
}

const defaultConfig: PerformanceConfig = {
  enableMemoryTracking: true,
  enableNetworkTracking: true,
  enableErrorTracking: true,
  sampleRate: 0.1, // Track 10% of sessions
};

export function usePerformance(
  componentName: string,
  config: PerformanceConfig = {}
) {
  const mergedConfig = { ...defaultConfig, ...config };
  const startTime = useRef(Date.now());
  const renderStartTime = useRef(Date.now());
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    networkRequests: 0,
    errors: 0,
  });

  // Sample rate check
  const shouldTrack = Math.random() < (mergedConfig.sampleRate || 0.1);

  useEffect(() => {
    if (!shouldTrack) return;

    const trackPerformance = () => {
      const loadTime = Date.now() - startTime.current;
      const renderTime = Date.now() - renderStartTime.current;

      const newMetrics: PerformanceMetrics = {
        loadTime,
        renderTime,
        networkRequests: 0,
        errors: 0,
      };

      // Memory usage (if available)
      if (mergedConfig.enableMemoryTracking && 'memory' in performance) {
        const memory = (performance as any).memory;
        if (memory) {
          newMetrics.memoryUsage = memory.usedJSHeapSize;
        }
      }

      setMetrics(newMetrics);

      // Send to analytics/monitoring service
      if (process.env.NODE_ENV === "production") {
        sendMetricsToService(componentName, newMetrics);
      }
    };

    // Track initial load
    const timer = setTimeout(trackPerformance, 100);

    return () => clearTimeout(timer);
  }, [componentName, mergedConfig, shouldTrack]);

  // Track render performance
  useEffect(() => {
    renderStartTime.current = Date.now();
  });

  // Track network requests
  useEffect(() => {
    if (!mergedConfig.enableNetworkTracking || !shouldTrack) return;

    const originalFetch = window.fetch;
    let requestCount = 0;

    window.fetch = async (...args) => {
      requestCount++;
      setMetrics(prev => ({
        ...prev,
        networkRequests: requestCount,
      }));

      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        setMetrics(prev => ({
          ...prev,
          errors: prev.errors + 1,
        }));
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [mergedConfig.enableNetworkTracking, shouldTrack]);

  // Track errors
  useEffect(() => {
    if (!mergedConfig.enableErrorTracking || !shouldTrack) return;

    const handleError = (event: ErrorEvent) => {
      setMetrics(prev => ({
        ...prev,
        errors: prev.errors + 1,
      }));

      // Send error to monitoring service
      if (process.env.NODE_ENV === "production") {
        sendErrorToService(componentName, event.error);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setMetrics(prev => ({
        ...prev,
        errors: prev.errors + 1,
      }));

      // Send error to monitoring service
      if (process.env.NODE_ENV === "production") {
        sendErrorToService(componentName, event.reason);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [componentName, mergedConfig.enableErrorTracking, shouldTrack]);

  return {
    metrics,
    isTracking: shouldTrack,
  };
}

// Hook for tracking page performance
export function usePagePerformance(pageName: string) {
  const [pageMetrics, setPageMetrics] = useState({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const trackPageMetrics = () => {
      // Basic load time
      const loadTime = performance.now();

      // Web Vitals
      const vitals: any = {};

      // First Contentful Paint
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              vitals.firstContentfulPaint = entry.startTime;
            }
          }
        });
        observer.observe({ entryTypes: ['paint'] });
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.largestContentfulPaint = lastEntry.startTime;
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // Cumulative Layout Shift
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cumulativeLayoutShift = clsValue;
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      }

      setPageMetrics({
        loadTime,
        firstContentfulPaint: vitals.firstContentfulPaint || 0,
        largestContentfulPaint: vitals.largestContentfulPaint || 0,
        cumulativeLayoutShift: vitals.cumulativeLayoutShift || 0,
      });

      // Send to analytics
      if (process.env.NODE_ENV === "production") {
        sendPageMetricsToService(pageName, {
          loadTime,
          ...vitals,
        });
      }
    };

    // Track after page load
    if (document.readyState === 'complete') {
      trackPageMetrics();
    } else {
      window.addEventListener('load', trackPageMetrics);
      return () => window.removeEventListener('load', trackPageMetrics);
    }
  }, [pageName]);

  return pageMetrics;
}

// Hook for tracking user interactions
export function useInteractionTracking(componentName: string) {
  const [interactions, setInteractions] = useState({
    clicks: 0,
    scrolls: 0,
    keypresses: 0,
    formSubmissions: 0,
  });

  useEffect(() => {
    const trackClick = () => {
      setInteractions(prev => ({ ...prev, clicks: prev.clicks + 1 }));
    };

    const trackScroll = () => {
      setInteractions(prev => ({ ...prev, scrolls: prev.scrolls + 1 }));
    };

    const trackKeypress = () => {
      setInteractions(prev => ({ ...prev, keypresses: prev.keypresses + 1 }));
    };

    const trackFormSubmit = () => {
      setInteractions(prev => ({ ...prev, formSubmissions: prev.formSubmissions + 1 }));
    };

    document.addEventListener('click', trackClick);
    document.addEventListener('scroll', trackScroll, { passive: true });
    document.addEventListener('keypress', trackKeypress);
    document.addEventListener('submit', trackFormSubmit);

    return () => {
      document.removeEventListener('click', trackClick);
      document.removeEventListener('scroll', trackScroll);
      document.removeEventListener('keypress', trackKeypress);
      document.removeEventListener('submit', trackFormSubmit);
    };
  }, []);

  return interactions;
}

// Utility functions for sending data to monitoring services
function sendMetricsToService(componentName: string, metrics: PerformanceMetrics) {
  // Example: Send to your analytics service
  console.log(`Performance metrics for ${componentName}:`, metrics);
  
  // Example implementation for services like Sentry, DataDog, etc.
  /*
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'performance_metrics', {
      component_name: componentName,
      load_time: metrics.loadTime,
      render_time: metrics.renderTime,
      memory_usage: metrics.memoryUsage,
      network_requests: metrics.networkRequests,
      errors: metrics.errors,
    });
  }
  */
}

function sendErrorToService(componentName: string, error: any) {
  console.error(`Error in ${componentName}:`, error);
  
  // Example: Send to error tracking service
  /*
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      tags: {
        component: componentName,
      },
    });
  }
  */
}

function sendPageMetricsToService(pageName: string, metrics: any) {
  console.log(`Page metrics for ${pageName}:`, metrics);
  
  // Example: Send to analytics service
  /*
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_performance', {
      page_name: pageName,
      ...metrics,
    });
  }
  */
}
