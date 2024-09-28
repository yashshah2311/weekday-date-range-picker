import React, { useState, useEffect } from 'react';

//Helper Functions
const isWeekday = (date: Date) => date.getUTCDay() !== 0 && date.getUTCDay() !== 6;
const formatDate = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString().split('T')[0];
const getDatesInRange = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];
  let currentDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
};

interface WeekdayDateRangePickerProps {
  onChange: (range: string[], weekends: string[]) => void;
  predefinedRanges?: { label: string; range: [string, string] }[];
}

const WeekdayDateRangePicker: React.FC<WeekdayDateRangePickerProps> = ({ onChange, predefinedRanges = [] }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getUTCMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getUTCFullYear());
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState<string[]>([]);
  const [weekendDates, setWeekendDates] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  useEffect(() => {
    if (startDate && endDate) {
      const allDates = getDatesInRange(startDate, endDate);
      const weekdays = allDates.filter(isWeekday).map(formatDate);
      const weekends = allDates.filter((date) => !isWeekday(date)).map(formatDate);
      
      setHighlightedDates(weekdays);
      setSelectedRange(weekdays);
      setWeekendDates(weekends);

      onChange(weekdays, weekends);
    }
  }, [startDate, endDate, onChange]);

  const handleDateClick = (date: Date) => {
    if (!isWeekday(date)) return;

    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    if (!startDate || (startDate && endDate)) {
      setStartDate(utcDate);
      setEndDate(null);
      setIsSelecting(true);
    } else if (startDate && !endDate && isSelecting) {
      if (utcDate < startDate) {
        setStartDate(utcDate);
        setEndDate(startDate);
      } else {
        setEndDate(utcDate);
      }
      setIsSelecting(false);
    }
  };

  const handlePredefinedRangeClick = (range: [string, string]) => {
    const [start, end] = range;
    setStartDate(new Date(Date.parse(start)));
    setEndDate(new Date(Date.parse(end)));
    setIsSelecting(false);
  };

  const handleMonthChange = (increment: number) => {
    setCurrentMonth((prev) => {
      let newMonth = prev + increment;
      if (newMonth < 0) {
        setCurrentYear((year) => year - 1);
        newMonth = 11;
      } else if (newMonth > 11) {
        setCurrentYear((year) => year + 1);
        newMonth = 0;
      }
      return newMonth;
    });
  };

  const handleYearChange = (increment: number) => {
    setCurrentYear((prev) => prev + increment);
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setHighlightedDates([]);
    setSelectedRange([]);
    setWeekendDates([]);
    setIsSelecting(false);
  };

  const renderCalendar = () => {
    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0));
    const allDates = getDatesInRange(startOfMonth, endOfMonth);
    const weeks: JSX.Element[][] = [];

    let week: JSX.Element[] = [];

    // Calculate empty cells before the first day of the month
    const firstDayOfWeek = startOfMonth.getUTCDay();
    const emptyCells = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = 0; i < emptyCells; i++) {
      week.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

    allDates.forEach((date) => {
      const formattedDate = formatDate(date);
      const isHighlighted = highlightedDates.includes(formattedDate);
      const isWeekend = !isWeekday(date);

      week.push(
        <td
          key={formattedDate}
          className={`p-2 text-center cursor-pointer ${
            isWeekend ? 'bg-red-200 cursor-not-allowed' : ''
          } ${isHighlighted ? 'bg-green-200' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          {date.getUTCDate()}
        </td>
      );

      // When it's Sunday, push the current week to weeks and reset the week array
      if (date.getUTCDay() === 0) {
        weeks.push(week);
        week = [];
      }
    });

    // Add remaining days of the week
    if (week.length > 0) {
      weeks.push(week);
    }

    return weeks.map((week, index) => <tr key={index}>{week}</tr>);
  };

  return (
    <div className="p-8 bg-white rounded shadow-lg max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button className="mx-2 px-2 py-2 bg-blue-500 text-white rounded" onClick={() => handleMonthChange(-1)}>
          Previous Month
        </button>
        <div className="flex items-center space-x-4">
          <button className="mx-2 px-2 py-2 bg-blue-500 text-white rounded" onClick={() => handleYearChange(-1)}>
            Previous Year
          </button>
          <span className="font-bold text-xl">{`${currentMonth + 1}/${currentYear}`}</span>
          <button className="mx-2 px-6 py-2 bg-blue-500 text-white rounded" onClick={() => handleYearChange(1)}>
            Next Year
          </button>
        </div>
        <button className="mx-2 px-2 py-2 bg-blue-500 text-white rounded" onClick={() => handleMonthChange(1)}>
          Next Month
        </button>
      </div>

      <table className="w-full border-collapse fixed-table-layout">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Mon</th>
            <th className="p-2">Tue</th>
            <th className="p-2">Wed</th>
            <th className="p-2">Thu</th>
            <th className="p-2">Fri</th>
            <th className="p-2">Sat</th>
            <th className="p-2">Sun</th>
          </tr>
        </thead>
        <tbody>{renderCalendar()}</tbody>
      </table>

      <div className="mt-4 flex flex-wrap">
        {predefinedRanges.map(({ label, range }) => (
          <button
            key={label}
            className="px-4 py-2 m-2 bg-green-500 text-white rounded"
            onClick={() => handlePredefinedRangeClick(range)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center space-x-4">
        <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={clearSelection}>
          Clear Selection
        </button>
      </div>

      <div className="mt-4 p-4 border rounded bg-gray-50 w-full max-h-24 overflow-y-auto">
        <h3 className="text-lg font-bold">Selected Weekday Range:</h3>
        <p className="whitespace-pre-wrap break-words">{selectedRange.join(', ') || 'None'}</p>
      </div>
      <div className="mt-2 p-4 border rounded bg-gray-50 w-full max-h-24 overflow-y-auto">
        <h3 className="text-lg font-bold">Weekend Dates in Range:</h3>
        <p className="whitespace-pre-wrap break-words">{weekendDates.join(', ') || 'None'}</p>
      </div>
    </div>
  );
};

export default WeekdayDateRangePicker;
