// Component Imports
import TopicTile from "./topicTile";
// Store Imports
import { useDataStore } from "../../stores/useDataStore";

// Interface Definition
interface TopicViewerProps {
  itemAddedSuccess: boolean;
}

// Component Definition
const TopicViewer = ({ itemAddedSuccess }: TopicViewerProps) => {
  const workTopics = useDataStore((state) => state.workTopics);

  const activeTopics = workTopics.filter((topic) => topic.last_action !== 3);

  return (
    <div className="flex flex-col w-full h-full space-y-2 py-1">
      <div className="flex md:flex-row flex-col md:space-x-2 md:space-y-0 space-y-1 md:items-center">
        <div className="flex flex-row h-6 space-x-2 items-center">
          <h2 className="font-semibold text-nowrap">Work Topics</h2>
        </div>
        <p
          className={`text-zinc-500 text-sm transition-all duration-300 ${
            itemAddedSuccess
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none h-0"
          }`}
        >
          Topic was added.
        </p>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        {activeTopics?.length !== 0 ? (
          activeTopics.map((workTopic) => (
            <TopicTile key={workTopic.id} workTopic={workTopic} />
          ))
        ) : (
          <div className="flex w-full h-full min-h-0 items-center justify-center">
            <p className="text-sm p-2">No Topics available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicViewer;
