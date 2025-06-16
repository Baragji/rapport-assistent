import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LazyChart from '../LazyChart';

// Create mocks before importing the component
vi.mock('../../hooks/usePerformanceMonitor', () => {
  return {
    useInView: vi.fn().mockReturnValue([{ current: null }, true]), // Always in view for tests
    default: vi.fn()
  };
});

// Mock the PieChart component
vi.mock('../PieChart', () => {
  return {
    default: vi.fn().mockImplementation((props) => (
      <div data-testid={props.testId || 'mocked-pie-chart'}>
        Mocked PieChart: {props.title}
        <div data-chart-type={props.initialChartType}></div>
      </div>
    ))
  };
});

// Mock the LoadingSpinner component
vi.mock('../LoadingSpinner', () => {
  return {
    default: vi.fn().mockImplementation((props) => (
      <div data-testid="mocked-loading-spinner" data-size={props.size}>
        Loading Spinner
      </div>
    ))
  };
});

// Sample chart data for tests
const sampleChartData = {
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [300, 50, 100],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      borderWidth: 1,
    },
  ],
};

describe('LazyChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the chart when in view', async () => {
    render(<LazyChart data={sampleChartData} title="Test Chart" testId="test-lazy-chart" />);
    
    // Wait for the chart to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('test-lazy-chart-chart')).toBeInTheDocument();
    });
    
    // Check if the chart title is rendered
    expect(screen.getByText(/Mocked PieChart: Test Chart/i)).toBeInTheDocument();
  });

  it('passes all props correctly to the PieChart component', async () => {
    render(
      <LazyChart
        data={sampleChartData}
        title="Custom Title"
        height="h-80"
        showStats={true}
        totalReports={500}
        initialChartType="bar"
        showChartTypeSelector={false}
        testId="custom-test-id"
      />
    );
    
    await waitFor(() => {
      const chart = screen.getByTestId('custom-test-id-chart');
      expect(chart).toBeInTheDocument();
      expect(chart.querySelector('[data-chart-type="bar"]')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Mocked PieChart: Custom Title/i)).toBeInTheDocument();
  });
});