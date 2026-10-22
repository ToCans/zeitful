import { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';

interface HeatmapProps {
  itemFilter: 'Task' | 'Topic' | string;
  timeFilteredWorkEntries: any[] | null;
  darkMode?: boolean;
}

const Heatmap = ({ itemFilter, timeFilteredWorkEntries, darkMode }: HeatmapProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    if (timeFilteredWorkEntries && timeFilteredWorkEntries.length > 0) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        try {
          setIsLoading(false);
        } catch (err) {
          setError('Failed to generate heatmap data');
          setIsLoading(false);
        }
      }, 500);
    }
  }, [timeFilteredWorkEntries, itemFilter]);

  const generateHeatmap = () => {
    if (!timeFilteredWorkEntries || timeFilteredWorkEntries.length === 0) {
      return <p className="text-center">No data available for heatmap</p>;
    }

    // Create a grid for heatmap visualization
    const grid = [];
    const today = new Date();
    
    // Create cells for a 7x7 grid (representing 7 days of activity)
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Generate mock values for demonstration
      const value = Math.floor(Math.random() * 100);
      
      // Determine color based on value (white = no activity, darker green = more activity)
      let cellColor = '';
      if (value === 0) {
        cellColor = 'bg-white'; // No activity - white
      } else if (value <= 20) {
        cellColor = 'bg-green-100'; // Low activity - light green
      } else if (value <= 40) {
        cellColor = 'bg-green-300'; // Medium activity - medium green
      } else if (value <= 60) {
        cellColor = 'bg-green-500'; // High activity - darker green
      } else if (value <= 80) {
        cellColor = 'bg-green-700'; // Very high activity - dark green
      } else {
        cellColor = 'bg-green-900'; // Extremely high activity - darkest green
      }
      
      grid.push(
        <div 
          key={dateString} 
          className={`w-10 h-10 rounded-lg ${cellColor} flex items-center justify-center text-xs`}
          title={`${dateString}: ${value}`}
        >
          {value}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-1 p-2">
        {grid}
      </div>
    );
  };

  return (
    <Card className={`p-4 rounded-lg ${darkMode ? 'bg-zinc-700' : 'bg-white'} shadow-lg`}>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Heatmap View</h3>
          <p className="text-sm mb-4">
            Visualize {itemFilter.toLowerCase()} activity over time
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center">
              <Calendar 
                value={startDate} 
                onChange={(e) => setStartDate(e.value)} 
                className="w-full"
                dateFormat="yy-mm-dd"
              />
              <span className="mx-2">to</span>
              <Calendar 
                value={endDate} 
                onChange={(e) => setEndDate(e.value)} 
                className="w-full"
                dateFormat="yy-mm-dd"
              />
            </div>
            
            <Dropdown 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.value)} 
              options={['week', 'month', 'quarter', 'year']}
              className="w-32"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <Button 
            label="Generate" 
            icon="pi pi-sync" 
            className="p-2"
            onClick={() => generateHeatmap()}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <ProgressBar 
            value={70} 
            showValue 
            className="w-full max-w-md" 
          />
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Activity Heatmap</h4>
            <div className="flex justify-center">
              {generateHeatmap()}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white rounded mr-2"></div>
              <span className="text-xs">No Activity</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-300 rounded mr-2"></div>
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-xs">High</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-700 rounded mr-2"></div>
              <span className="text-xs">Very High</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-900 rounded mr-2"></div>
              <span className="text-xs">Extremely High</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Heatmap;