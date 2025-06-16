/**
 * Chart types and interfaces for the enhanced chart components
 */

export type ChartType = 'pie' | 'bar' | 'line' | 'doughnut';

export type EasingType =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint';

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string[] | string;
  borderColor: string[] | string;
  borderWidth: number;
  hoverOffset?: number;
  tension?: number;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface TooltipCallbacks {
  label?: (context: Record<string, unknown>) => string;
  title?: (context: Record<string, unknown>[]) => string;
  footer?: (context: Record<string, unknown>[]) => string;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    tooltip?: {
      enabled?: boolean;
      callbacks?: TooltipCallbacks;
    };
    legend?: {
      position?: 'top' | 'left' | 'right' | 'bottom';
      display?: boolean;
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  animation?: {
    animateRotate?: boolean;
    animateScale?: boolean;
    duration?: number;
    easing?: EasingType;
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
      grid?: {
        display?: boolean;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
      grid?: {
        display?: boolean;
      };
      beginAtZero?: boolean;
    };
  };
  onClick?: (event: MouseEvent, elements: unknown[]) => void;
}

export interface ChartTooltipData {
  title?: string;
  label?: string;
  value?: number | string;
  percentage?: number;
  color?: string;
}

export interface ChartClickEvent {
  datasetIndex: number;
  index: number;
  value: number;
  label: string;
}
