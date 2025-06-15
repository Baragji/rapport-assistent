import { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ReportForm from './components/ReportForm';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define the form data interface
interface FormData {
  title: string;
  content: string;
  category: string;
}

function App() {
  const [reports, setReports] = useState<FormData[]>([]);

  // Sample data for the pie chart
  const chartData = {
    labels: ['Technical', 'Business', 'Research', 'Other'],
    datasets: [
      {
        label: 'Report Categories',
        data: [12, 19, 3, 5],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleFormSubmit = (formData: FormData) => {
    // Add the new report to our reports array
    setReports([...reports, formData]);
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-center text-blue-600">Rapport Assistent</h1>
          <p className="text-center text-gray-600 mt-2">
            Create, manage, and visualize your reports with ease
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <ReportForm onSubmit={handleFormSubmit} />

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Report Categories</h2>
            <div className="h-64">
              <Pie data={chartData} />
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-700">Report Statistics</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>Total Reports: {39 + reports.length}</li>
                <li>Average Length: 1,250 words</li>
                <li>Most Common Category: Technical</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Rapport Assistent &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
