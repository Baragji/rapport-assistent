import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PieChart from '../PieChart';

// Mock Chart.js and react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Pie: ({ data }: { data: Record<string, unknown> }) => (
    <div data-testid="pie-chart" data-chart-data={JSON.stringify(data)}>
      Mocked Pie Chart
    </div>
  ),
}));

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

describe('PieChart Component', () => {
  const mockData = {
    labels: ['Category A', 'Category B', 'Category C'],
    datasets: [
      {
        label: 'Test Data',
        data: [10, 20, 30],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderWidth: 1,
      },
    ],
  };

  it('renders with default props', () => {
    render(<PieChart data={mockData} />);
    
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    const customTitle = 'Custom Chart Title';
    render(<PieChart data={mockData} title={customTitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('applies custom height class', () => {
    const customHeight = 'h-96';
    render(<PieChart data={mockData} height={customHeight} />);
    
    const chartContainer = screen.getByTestId('pie-chart').parentElement;
    expect(chartContainer).toHaveClass(customHeight);
  });

  it('passes correct data to Pie component', () => {
    render(<PieChart data={mockData} />);
    
    const pieChart = screen.getByTestId('pie-chart');
    const chartData = JSON.parse(pieChart.getAttribute('data-chart-data') || '{}');
    
    expect(chartData.labels).toEqual(mockData.labels);
    expect(chartData.datasets[0].data).toEqual(mockData.datasets[0].data);
  });

  it('shows statistics when showStats is true', () => {
    render(<PieChart data={mockData} showStats={true} />);
    
    expect(screen.getByText('Report Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Reports: 60')).toBeInTheDocument(); // Sum of data: 10+20+30
    expect(screen.getByText('Average Length: 1,250 words')).toBeInTheDocument();
    expect(screen.getByText('Most Common Category: Category C')).toBeInTheDocument(); // Highest value is 30
  });

  it('hides statistics when showStats is false', () => {
    render(<PieChart data={mockData} showStats={false} />);
    
    expect(screen.queryByText('Report Statistics')).not.toBeInTheDocument();
  });

  it('uses totalReports prop when provided', () => {
    const totalReports = 100;
    render(<PieChart data={mockData} showStats={true} totalReports={totalReports} />);
    
    expect(screen.getByText(`Total Reports: ${totalReports}`)).toBeInTheDocument();
  });

  it('calculates total from data when totalReports is not provided', () => {
    render(<PieChart data={mockData} showStats={true} />);
    
    // Sum of mockData: 10 + 20 + 30 = 60
    expect(screen.getByText('Total Reports: 60')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData = {
      labels: [],
      datasets: [
        {
          label: 'Empty Data',
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        },
      ],
    };

    render(<PieChart data={emptyData} showStats={true} />);
    
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByText('Total Reports: 0')).toBeInTheDocument();
    expect(screen.getByText('Most Common Category: Unknown')).toBeInTheDocument();
  });

  it('handles missing datasets gracefully', () => {
    const invalidData = {
      labels: ['Category A'],
      datasets: [],
    };

    render(<PieChart data={invalidData} showStats={true} />);
    
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByText('Total Reports: 0')).toBeInTheDocument();
    // When datasets is empty but labels exist, it falls back to first label
    expect(screen.getByText('Most Common Category: Category A')).toBeInTheDocument();
  });

  it('handles completely empty data gracefully', () => {
    const completelyEmptyData = {
      labels: [],
      datasets: [],
    };

    render(<PieChart data={completelyEmptyData} showStats={true} />);
    
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByText('Total Reports: 0')).toBeInTheDocument();
    expect(screen.getByText('Most Common Category: Unknown')).toBeInTheDocument();
  });

  it('finds correct most common category', () => {
    const testData = {
      labels: ['Low', 'Medium', 'High'],
      datasets: [
        {
          label: 'Priority Distribution',
          data: [5, 25, 15], // Medium (25) is highest
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          borderWidth: 1,
        },
      ],
    };

    render(<PieChart data={testData} showStats={true} />);
    
    expect(screen.getByText('Most Common Category: Medium')).toBeInTheDocument();
  });

  it('handles single category data', () => {
    const singleCategoryData = {
      labels: ['Only Category'],
      datasets: [
        {
          label: 'Single Category',
          data: [42],
          backgroundColor: ['#FF6384'],
          borderColor: ['#FF6384'],
          borderWidth: 1,
        },
      ],
    };

    render(<PieChart data={singleCategoryData} showStats={true} />);
    
    expect(screen.getByText('Total Reports: 42')).toBeInTheDocument();
    expect(screen.getByText('Most Common Category: Only Category')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    render(<PieChart data={mockData} />);
    
    const container = screen.getByTestId('pie-chart').closest('.bg-white');
    expect(container).toHaveClass('bg-white', 'p-6', 'rounded-lg', 'shadow-md');
    
    const title = screen.getByText('Chart');
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'mb-4', 'text-gray-800');
  });

  it('applies correct CSS classes for statistics section', () => {
    render(<PieChart data={mockData} showStats={true} />);
    
    const statsSection = screen.getByText('Report Statistics').closest('.bg-gray-50');
    expect(statsSection).toHaveClass('mt-6', 'p-4', 'bg-gray-50', 'rounded-md');
  });
});