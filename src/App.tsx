import { useState, useEffect } from 'react';
import ReportForm from './components/ReportForm';
import PieChart from './components/PieChart';
import { initAnalyticsSession } from './services/analyticsService';

// Define the form data interface
interface FormData {
  title: string;
  content: string;
  category: string;
}

function App() {
  const [reports, setReports] = useState<FormData[]>([]);
  
  // Initialize analytics session when the app starts
  useEffect(() => {
    initAnalyticsSession();
  }, []);

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
          <PieChart 
            data={chartData}
            title="Report Categories"
            showStats={true}
            totalReports={39 + reports.length}
          />
          {/* We'll remove this hidden span as it's causing test conflicts */}
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Rapport Assistent &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
