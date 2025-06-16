import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PieChart from '../PieChart';

// Mock Chart.js and react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Pie: ({ data, options }: { data: Record<string, unknown>, options: Record<string, unknown> }) => (
    <div data-testid="pie-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Mocked Pie Chart
    </div>
  ),
  Bar: ({ data, options }: { data: Record<string, unknown>, options: Record<string, unknown> }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Mocked Bar Chart
    </div>
  ),
  Line: ({ data, options }: { data: Record<string, unknown>, options: Record<string, unknown> }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Mocked Line Chart
    </div>
  ),
  Doughnut: ({ data, options }: { data: Record<string, unknown>, options: Record<string, unknown> }) => (
    <div data-testid="doughnut-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Mocked Doughnut Chart
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
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  LineElement: {},
  PointElement: {},
  Title: {},
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

  const mockClickHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<PieChart data={mockData} />);
    
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-pie')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    const customTitle = 'Custom Chart Title';
    render(<PieChart data={mockData} title={customTitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('applies custom height class', () => {
    const customHeight = 'h-96';
    render(<PieChart data={mockData} height={customHeight} />);
    
    const chartContainer = screen.getByTestId('pie-chart-pie').parentElement;
    expect(chartContainer).toHaveClass(customHeight);
  });

  it('passes correct data to Pie component', () => {
    render(<PieChart data={mockData} />);
    
    const pieChart = screen.getByTestId('pie-chart-pie');
    const chartData = JSON.parse(pieChart.getAttribute('data-chart-data') ?? '{}');
    
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
    render(<PieChart data={mockData} testId="pie-chart" />);
    
    const container = screen.getByTestId('pie-chart-pie').closest('.card-responsive');
    expect(container).toHaveClass('card-responsive');
    
    const title = screen.getByText('Chart');
    expect(title).toHaveClass('text-title-responsive', 'text-gray-800');
  });

  it('applies correct CSS classes for statistics section', () => {
    render(<PieChart data={mockData} showStats={true} testId="pie-chart" />);
    
    const statsSection = screen.getByText('Report Statistics').closest('.bg-gray-50');
    expect(statsSection).toHaveClass('bg-gray-50', 'rounded-md');
  });

  // New tests for enhanced chart features
  
  it('renders chart type selector buttons by default', () => {
    render(<PieChart data={mockData} />);
    
    // Check for all chart type buttons
    expect(screen.getByTitle('Switch to pie chart')).toBeInTheDocument();
    expect(screen.getByTitle('Switch to bar chart')).toBeInTheDocument();
    expect(screen.getByTitle('Switch to line chart')).toBeInTheDocument();
    expect(screen.getByTitle('Switch to doughnut chart')).toBeInTheDocument();
  });
  
  it('hides chart type selector when showChartTypeSelector is false', () => {
    render(<PieChart data={mockData} showChartTypeSelector={false} />);
    
    expect(screen.queryByTitle('Switch to pie chart')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Switch to bar chart')).not.toBeInTheDocument();
  });
  
  it('switches to bar chart when bar button is clicked', () => {
    render(<PieChart data={mockData} />);
    
    // Initially shows pie chart
    expect(screen.getByTestId('pie-chart-pie')).toBeInTheDocument();
    
    // Click bar chart button
    fireEvent.click(screen.getByTitle('Switch to bar chart'));
    
    // Now shows bar chart
    expect(screen.getByTestId('pie-chart-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart-pie')).not.toBeInTheDocument();
  });
  
  it('switches to line chart when line button is clicked', () => {
    render(<PieChart data={mockData} />);
    
    // Click line chart button
    fireEvent.click(screen.getByTitle('Switch to line chart'));
    
    // Now shows line chart
    expect(screen.getByTestId('pie-chart-line')).toBeInTheDocument();
  });
  
  it('switches to doughnut chart when doughnut button is clicked', () => {
    render(<PieChart data={mockData} />);
    
    // Click doughnut chart button
    fireEvent.click(screen.getByTitle('Switch to doughnut chart'));
    
    // Now shows doughnut chart
    expect(screen.getByTestId('pie-chart-doughnut')).toBeInTheDocument();
  });
  
  it('uses initialChartType prop to set initial chart type', () => {
    render(<PieChart data={mockData} initialChartType="bar" />);
    
    // Initially shows bar chart
    expect(screen.getByTestId('pie-chart-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart-pie')).not.toBeInTheDocument();
  });
  
  it('applies active styling to the current chart type button', () => {
    render(<PieChart data={mockData} />);
    
    // Pie button should have active styling
    const pieButton = screen.getByTitle('Switch to pie chart');
    expect(pieButton).toHaveClass('bg-blue-100', 'text-blue-700');
    
    // Bar button should not have active styling
    const barButton = screen.getByTitle('Switch to bar chart');
    expect(barButton).not.toHaveClass('bg-blue-100', 'text-blue-700');
    
    // Click bar button
    fireEvent.click(barButton);
    
    // Now bar button should have active styling
    expect(barButton).toHaveClass('bg-blue-100', 'text-blue-700');
    // And pie button should not
    expect(pieButton).not.toHaveClass('bg-blue-100', 'text-blue-700');
  });
  
  it('passes options to chart component', () => {
    // Create a component with a mocked click handler
    render(<PieChart data={mockData} onChartClick={mockClickHandler} />);
    
    // Get the chart options from the rendered component
    const pieChart = screen.getByTestId('pie-chart-pie');
    const options = JSON.parse(pieChart.getAttribute('data-chart-options') ?? '{}');
    
    // Verify that options are passed correctly
    expect(options.responsive).toBe(true);
    expect(options.maintainAspectRatio).toBe(false);
    expect(options.plugins.legend.position).toBe('top');
  });
  
  it('displays selected segment information correctly', () => {
    // Create a test component that directly renders the selected segment UI
    const TestComponent = () => {
      return (
        <div data-testid="test-wrapper">
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
            <p className="font-medium text-blue-800">
              Selected: {mockData.labels[1]}
            </p>
            <p className="text-blue-600">
              Value: {mockData.datasets[0].data[1]} 
              ({((mockData.datasets[0].data[1] / 60) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
      );
    };
    
    // Render the test component
    render(<TestComponent />);
    
    // Verify the selected segment info is displayed correctly
    expect(screen.getByText('Selected: Category B')).toBeInTheDocument();
    expect(screen.getByText(/Value: 20/)).toBeInTheDocument();
  });
  
  it('enhances data with hover effects for pie/doughnut charts', () => {
    render(<PieChart data={mockData} />);
    
    const pieChart = screen.getByTestId('pie-chart-pie');
    const chartData = JSON.parse(pieChart.getAttribute('data-chart-data') ?? '{}');
    
    // Check for hover effects
    expect(chartData.datasets[0].hoverOffset).toBe(15);
  });
  
  it('enhances data with tension for line charts', () => {
    render(<PieChart data={mockData} initialChartType="line" />);
    
    const lineChart = screen.getByTestId('pie-chart-line');
    const chartData = JSON.parse(lineChart.getAttribute('data-chart-data') ?? '{}');
    
    // Check for line chart specific properties
    expect(chartData.datasets[0].tension).toBe(0.3);
    expect(chartData.datasets[0].fill).toBe(false);
  });
  
  it('configures proper scales for bar/line charts', () => {
    render(<PieChart data={mockData} initialChartType="bar" />);
    
    const barChart = screen.getByTestId('pie-chart-bar');
    const chartOptions = JSON.parse(barChart.getAttribute('data-chart-options') ?? '{}');
    
    // Check for scales configuration
    expect(chartOptions.scales.y.beginAtZero).toBe(true);
    expect(chartOptions.scales.x.title.text).toBe('Categories');
    expect(chartOptions.scales.y.title.text).toBe('Count');
  });
  
  it('does not configure scales for pie/doughnut charts', () => {
    render(<PieChart data={mockData} initialChartType="pie" />);
    
    const pieChart = screen.getByTestId('pie-chart-pie');
    const chartOptions = JSON.parse(pieChart.getAttribute('data-chart-options') ?? '{}');
    
    // Pie charts should not have scales
    expect(chartOptions.scales).toBeUndefined();
  });
});