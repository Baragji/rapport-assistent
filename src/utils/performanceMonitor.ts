/**
 * Performance monitoring utilities for AI operations and system health
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

interface AIOperationMetric extends PerformanceMetric {
  operation: 'generate' | 'stream' | 'template-fill';
  templateId?: string;
  success: boolean;
  error?: string;
  tokenCount?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private aiMetrics: AIOperationMetric[] = [];
  private maxMetricsHistory = 100;

  /**
   * Start tracking a performance metric
   */
  startMetric(name: string, metadata?: Record<string, unknown>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  /**
   * End tracking a performance metric
   */
  endMetric(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Metric ${name} not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    // Log slow operations
    if (metric.duration > 5000) { // 5 seconds
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    return metric.duration;
  }

  /**
   * Track AI operation metrics
   */
  trackAIOperation(
    operation: 'generate' | 'stream' | 'template-fill',
    templateId: string | undefined,
    duration: number,
    success: boolean,
    error?: string,
    tokenCount?: number
  ): void {
    const metric: AIOperationMetric = {
      name: `ai-${operation}`,
      operation,
      templateId,
      startTime: Date.now() - duration,
      endTime: Date.now(),
      duration,
      success,
      error,
      tokenCount
    };

    this.aiMetrics.push(metric);

    // Keep only recent metrics
    if (this.aiMetrics.length > this.maxMetricsHistory) {
      this.aiMetrics.shift();
    }

    // Log errors
    if (!success && error) {
      console.error(`AI operation failed: ${operation} - ${error}`);
    }
  }

  /**
   * Get AI operation statistics
   */
  getAIStats(): {
    totalOperations: number;
    successRate: number;
    averageDuration: number;
    errorRate: number;
    slowOperations: number;
  } {
    if (this.aiMetrics.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        averageDuration: 0,
        errorRate: 0,
        slowOperations: 0
      };
    }

    const successful = this.aiMetrics.filter(m => m.success).length;
    const totalDuration = this.aiMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const slowOps = this.aiMetrics.filter(m => (m.duration || 0) > 10000).length;

    return {
      totalOperations: this.aiMetrics.length,
      successRate: (successful / this.aiMetrics.length) * 100,
      averageDuration: totalDuration / this.aiMetrics.length,
      errorRate: ((this.aiMetrics.length - successful) / this.aiMetrics.length) * 100,
      slowOperations: slowOps
    };
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const stats = this.getAIStats();
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check error rate
    if (stats.errorRate > 20) {
      status = 'critical';
      issues.push(`High AI error rate: ${stats.errorRate.toFixed(1)}%`);
      recommendations.push('Check API key configuration and network connectivity');
    } else if (stats.errorRate > 10) {
      status = 'warning';
      issues.push(`Elevated AI error rate: ${stats.errorRate.toFixed(1)}%`);
      recommendations.push('Monitor AI service stability');
    }

    // Check performance
    if (stats.averageDuration > 15000) {
      if (status !== 'critical') status = 'warning';
      issues.push(`Slow AI responses: ${(stats.averageDuration / 1000).toFixed(1)}s average`);
      recommendations.push('Consider optimizing prompts or checking network speed');
    }

    // Check success rate
    if (stats.successRate < 80) {
      status = 'critical';
      issues.push(`Low AI success rate: ${stats.successRate.toFixed(1)}%`);
      recommendations.push('Review AI client configuration and error handling');
    }

    return { status, issues, recommendations };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    timestamp: number;
    aiMetrics: AIOperationMetric[];
    systemHealth: ReturnType<typeof this.getSystemHealth>;
    stats: ReturnType<typeof this.getAIStats>;
  } {
    return {
      timestamp: Date.now(),
      aiMetrics: [...this.aiMetrics],
      systemHealth: this.getSystemHealth(),
      stats: this.getAIStats()
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.aiMetrics.length = 0;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types for external use
export type { PerformanceMetric, AIOperationMetric };

export default performanceMonitor;