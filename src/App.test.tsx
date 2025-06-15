import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the ReportForm component
vi.mock('./components/ReportForm', () => ({
  default: ({ onSubmit }: { onSubmit: (data: any) => void }) => (
    <div data-testid="report-form">
      <h2>Create New Report</h2>
      <button onClick={() => onSubmit({ title: 'Test', content: 'Test content', category: 'Technical' })}>
        Submit
      </button>
    </div>
  ),
}));

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart">Mocked Pie Chart</div>,
}));

describe('App Component', () => {
  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByText('Rapport Assistent')).toBeInTheDocument();
    expect(screen.getByText('Create, manage, and visualize your reports with ease')).toBeInTheDocument();
  });

  it('renders the form section', () => {
    render(<App />);
    expect(screen.getByText('Create New Report')).toBeInTheDocument();
    expect(screen.getByTestId('report-form')).toBeInTheDocument();
  });

  it('renders the chart section', () => {
    render(<App />);
    expect(screen.getByText('Report Categories')).toBeInTheDocument();
    expect(screen.getByText('Report Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Reports: 39')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});