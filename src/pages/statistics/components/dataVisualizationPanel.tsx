// Component Imports
import ItemPercentageBreakdown from './itemPercentageBreakdown';
import OverallStats from './overallStats';
import PiChart from './piChart';
import Heatmap from '../../components/heatmap/Heatmap';
// Hook Imports
import UseGatherGroupedData from '../hooks/useGatherGroupedData';
// Store Imports
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { useDataStore } from '../../../stores/useDataStore';
// Component Imports
import { Skeleton } from 'primereact/skeleton';
// Type Imports
import { type WorkEntry } from '../../../types/types';

// Interface Definition
interface DataVisualizationPanelProps {
	itemFilter: 'Task' | 'Topic' | string;
	timeFilteredWorkEntries: WorkEntry[] | null;
}

// Component Definition
const DataVisualizationPanel = ({
	itemFilter,
	timeFilteredWorkEntries,
}: DataVisualizationPanelProps) => {
	const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
	const workTasks = useDataStore((state) => state.workTasks);
	const workTopics = useDataStore((state) => state.workTopics);
	const workEntries = useDataStore((state) => state.workEntries);

	const { groupedWorkEntries, isLoading } = UseGatherGroupedData({
		itemFilter,
		workEntries: timeFilteredWorkEntries,
		workTasks,
		workTopics,
	});

	return (
		<div className='flex md:flex-row flex-col w-full h-full overflow-y-auto md:gap-4 gap-2 p-2'>
			{/* Chart and Topic Breakdown */}
			<div className='flex flex-col md:w-1/2 md:h-full h-11/12 w-full'>
				{isLoading ? (
					<Skeleton className='flex flex-1' />
				) : (
					<div className='flex flex-col h-full w-full gap-4 items-center'>
						<p className='font-semibold text-sm w-full'>
							{itemFilter} Breakdown
						</p>
						{groupedWorkEntries && (
							<>
								<PiChart itemData={groupedWorkEntries} />
								<ItemPercentageBreakdown itemData={groupedWorkEntries} />
							</>
						)}
					</div>
				)}
			</div>

			{/* Divider */}
			<div
				className={`md:h-full h-1 md:w-1 w-full ${darkMode ? 'bg-gray-400' : 'bg-gray-200'
					} rounded-b-lg`}
			/>

			{/* Overall Stats */}
			<div className='flex flex-col md:w-1/2 md:h-full h-11/12 w-full gap-4 items-center'>
				{isLoading ? (
					<Skeleton className='flex flex-1' />
				) : (
					<OverallStats
						itemFilter={itemFilter}
						itemFilteredData={groupedWorkEntries}
						periodFilteredData={timeFilteredWorkEntries}
						unfilteredData={workEntries}
					/>
				)}
			</div>
		</div>
	);
};

export default DataVisualizationPanel;