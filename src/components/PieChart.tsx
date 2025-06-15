import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface PieChartProps {
  data: ChartData;
  title?: string;
  height?: string;
  showStats?: boolean;
  totalReports?: number;
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title = "Chart", 
  height = "h-64",
  showStats = false,
  totalReports = 0
}) => {
  // Calculate total from data
  const dataTotal = data.datasets[0]?.data.reduce((sum, value) => sum + value, 0) || 0;
  const displayTotal = totalReports > 0 ? totalReports : dataTotal;
  
  // Find most common category
  const maxIndex = data.datasets[0]?.data.indexOf(Math.max(...data.datasets[0].data)) || 0;
  const mostCommonCategory = data.labels[maxIndex] || 'Unknown';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
      <div className={height}>
        <Pie data={data} />
      </div>
      {showStats && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-700">Report Statistics</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>Total Reports: {displayTotal}</li>
            <li>Average Length: 1,250 words</li>
            <li>Most Common Category: {mostCommonCategory}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PieChart;