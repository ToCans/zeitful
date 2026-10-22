// Component Import
import ColorIcon from "../../../components/ItemManager/colorIcon";
// Utils Imports
import { formatMinutes } from "../../../utils/time";
import { intToColor } from "../../../utils/colors";

// Interface Defintion
interface ItemPercentageTileProps {
  index: number;
  id: string;
  color: number;
  itemName: string;
  itemDuration: number;
  topicPercentage: number;
}

// Component Defintion
const ItemPercentageTile = ({
  id,
  color,
  itemName,
  itemDuration,
  topicPercentage,
}: ItemPercentageTileProps) => {
  return (
    <div key={id} className="flex flex-row items-center w-full space-x-1">
      <ColorIcon color={intToColor(color)} />
      {/* Wrap name and duration in a flex container with flex-1 */}
      <div className="flex w-1/2 flex-row">
        <p className="text-sm">{itemName}</p>
      </div>
      <div className="flex w-1/2 flex-row justify-between items-center">
        <p className="text-xs text-left font-semibold">
          {formatMinutes(itemDuration)}
        </p>
        {/* Last item aligned to the right */}
        <p className="text-xs font-semibold text-right">
          {topicPercentage.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default ItemPercentageTile;
