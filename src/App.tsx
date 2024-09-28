import React from 'react';
import WeekdayDateRangePicker from './components/WeekdayDateRangePicker';

const App: React.FC = () => {
  const handleDateRangeChange = (range: string[], weekends: string[]) => {
    console.log('Selected Weekday Range:', range);
    console.log('Weekend Dates in Range:', weekends);
  };

  // Correctly define the predefined ranges using a tuple `[string, string]` for `range`
  const predefinedRanges = [
    { label: 'Last 7 Days', range: [formatDate(new Date(new Date().setDate(new Date().getDate() - 7))), formatDate(new Date())] as [string, string] },
    { label: 'Last 30 Days', range: [formatDate(new Date(new Date().setDate(new Date().getDate() - 30))), formatDate(new Date())] as [string, string] },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <WeekdayDateRangePicker onChange={handleDateRangeChange} predefinedRanges={predefinedRanges} />
    </div>
  );
};

// Helper function to format the date as 'YYYY-MM-DD'
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default App;
