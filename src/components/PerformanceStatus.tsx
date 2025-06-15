/**
 * Performance status component for monitoring AI operations
 */

import { useState, useEffect } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

interface PerformanceStatusProps {
  className?: string;
  showDetails?: boolean;
}

const PerformanceStatus = ({ className = '', showDetails = false }: PerformanceStatusProps) => {
  const [stats, setStats] = useState(performanceMonitor.getAIStats());
  const [health, setHealth] = useState(performanceMonitor.getSystemHealth());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(performanceMonitor.getAIStats());
      setHealth(performanceMonitor.getSystemHealth());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (!showDetails && health.status === 'healthy') {
    return null; // Don't show anything if system is healthy and details not requested
  }

  return (
    <div className={`performance-status ${className}`}>
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(health.status)}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${health.status === 'healthy' ? 'bg-green-500' : health.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
        AI System: {health.status}
      </div>

      {showDetails && (
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <div>Operations: {stats.totalOperations}</div>
          <div>Success Rate: {stats.successRate.toFixed(1)}%</div>
          <div>Avg Response: {formatDuration(stats.averageDuration)}</div>
          {stats.slowOperations > 0 && (
            <div className="text-yellow-600">Slow Ops: {stats.slowOperations}</div>
          )}
        </div>
      )}

      {health.issues.length > 0 && (
        <div className="mt-2 text-xs">
          {health.issues.map((issue, index) => (
            <div key={index} className="text-red-600">⚠ {issue}</div>
          ))}
        </div>
      )}

      {health.recommendations.length > 0 && showDetails && (
        <div className="mt-2 text-xs">
          {health.recommendations.map((rec, index) => (
            <div key={index} className="text-blue-600">💡 {rec}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceStatus;