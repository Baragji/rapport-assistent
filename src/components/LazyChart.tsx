import { lazy, Suspense, useState, useEffect } from 'react';
import type { ChartType, ChartData, ChartClickEvent } from '../types/chart';
import LoadingSpinner from './LoadingSpinner';
import { useInView } from '../hooks/usePerformanceMonitor';

// Lazy load the PieChart component
const PieChart = lazy(() => import('./PieChart'));

interface LazyChartProps {
  data: ChartData;
  title?: string;
  height?: string;
  showStats?: boolean;
  totalReports?: number;
  initialChartType?: ChartType;
  showChartTypeSelector?: boolean;
  onChartClick?: (event: ChartClickEvent) => void;
  testId?: string;
  loadingThreshold?: number; // ms to wait before showing loading indicator
  placeholderHeight?: string;
  loadingText?: string;
}

/**
 * LazyChart component that only loads the chart when it's in the viewport
 * This improves initial page load performance by deferring chart rendering
 */
const LazyChart: React.FC<LazyChartProps> = ({
  data,
  title = 'Chart',
  height = 'h-64',
  showStats = false,
  totalReports = 0,
  initialChartType = 'pie',
  showChartTypeSelector = true,
  onChartClick,
  testId = 'lazy-chart',
  loadingThreshold = 300,
  placeholderHeight = 'h-64',
  loadingText = 'Loading chart...',
}) => {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  // Show loading indicator after threshold to avoid flashing for fast loads
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, loadingThreshold);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading, loadingThreshold]);

  // Reset loading state when chart comes into view
  useEffect(() => {
    if (inView) {
      // Small delay to allow for component to load
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [inView]);

  return (
    <div ref={ref} data-testid={testId} className="chart-container">
      {inView ? (
        <Suspense 
          fallback={
            <div 
              className={`flex items-center justify-center ${placeholderHeight} bg-gray-50 rounded-md`}
              data-testid={`${testId}-loading`}
            >
              {showLoadingIndicator && (
                <div className="text-center">
                  <LoadingSpinner size="medium" />
                  <p className="mt-2 text-gray-600">{loadingText}</p>
                </div>
              )}
            </div>
          }
        >
          <PieChart
            data={data}
            title={title}
            height={height}
            showStats={showStats}
            totalReports={totalReports}
            initialChartType={initialChartType}
            showChartTypeSelector={showChartTypeSelector}
            onChartClick={onChartClick}
            testId={`${testId}-chart`}
          />
        </Suspense>
      ) : (
        <div 
          className={`${placeholderHeight} bg-gray-50 rounded-md flex items-center justify-center`}
          data-testid={`${testId}-placeholder`}
        >
          <div className="text-center text-gray-400">
            <p>Chart will load when visible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyChart;