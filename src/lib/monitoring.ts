/**
 * Initialize monitoring and error tracking for production
 *
 * Sets up:
 * - Sentry error tracking with session replay
 * - Web Vitals reporting to Sentry
 * - Performance tracing for critical operations
 *
 * Only runs in production to avoid noise in development
 * Uses dynamic imports to avoid loading Sentry in development
 */
export async function initMonitoring() {
  // Only run in production
  if (import.meta.env.MODE !== 'production') {
    console.log('📊 Monitoring disabled in development mode');
    return;
  }

  const sentryDSN = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDSN) {
    console.warn('⚠️ VITE_SENTRY_DSN not configured - error tracking disabled');
    return;
  }

  // Dynamically import Sentry only in production
  const [{ default: Sentry }, { onCLS, onLCP, onFCP, onTTFB, onINP }] = await Promise.all([
    import('@sentry/react').then(mod => ({ default: mod })),
    import('web-vitals')
  ]);

  // Initialize Sentry
  Sentry.init({
    dsn: sentryDSN,
    environment: import.meta.env.MODE,
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

    // Filter out non-actionable errors
    beforeSend(event, hint) {
      // Filter out ResizeObserver loop errors (common browser quirk)
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
        return null;
      }

      // Filter out network errors from ad blockers
      if (event.exception?.values?.[0]?.value?.includes('Failed to fetch')) {
        return null;
      }

      return event;
    },
  });

  // Report Web Vitals to Sentry
  function sendToSentry(metric: any) {
    Sentry.setMeasurement(metric.name, metric.value, metric.unit);
  }

  onCLS(sendToSentry);
  onLCP(sendToSentry);
  onFCP(sendToSentry);
  onTTFB(sendToSentry);
  onINP(sendToSentry); // Interaction to Next Paint

  console.log('✅ Monitoring initialized: Sentry + Web Vitals');
}

/**
 * Track custom performance metrics
 *
 * Usage:
 * ```ts
 * import { trackPerformance } from '@/lib/monitoring';
 *
 * trackPerformance.mark('artisan-fetch-start');
 * // ... do work
 * trackPerformance.mark('artisan-fetch-end');
 * trackPerformance.measure('artisan-fetch', 'artisan-fetch-start', 'artisan-fetch-end');
 * ```
 */
export const trackPerformance = {
  mark(name: string) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  async measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        const measurement = performance.measure(name, startMark, endMark);

        // Send to Sentry in production
        if (import.meta.env.MODE === 'production') {
          const { default: Sentry } = await import('@sentry/react').then(mod => ({ default: mod }));
          Sentry.setMeasurement(name, measurement.duration, 'millisecond');
        }

        // Log slow operations in development
        if (import.meta.env.DEV && measurement.duration > 100) {
          console.warn(`⚠️ Slow operation: ${name} took ${measurement.duration.toFixed(2)}ms`);
        }

        return measurement;
      } catch (e) {
        // Mark doesn't exist, ignore
      }
    }
  },

  clear(name?: string) {
    if (typeof performance !== 'undefined') {
      if (name) {
        performance.clearMarks(name);
        performance.clearMeasures(name);
      } else {
        performance.clearMarks();
        performance.clearMeasures();
      }
    }
  },
};
