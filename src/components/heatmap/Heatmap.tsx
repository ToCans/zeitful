import React from 'react';

interface HeatmapProps {
  data: number[][];
  size?: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ data, size = 10 }) => {
  return (
    <div className="heatmap-container">
      <svg className="heatmap" width={size * 10} height={size * 10}>
        {data.map((row, rowIndex) => (
          row.map((value, colIndex) => (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * 10}
              y={rowIndex * 10}
              width="8"
              height="8"
              className={value > 0 ? 'fill-blue-500' : 'fill-gray-200'}
            />
          ))
        ))}
      </svg>
    </div>
  );
};

export default Heatmap;