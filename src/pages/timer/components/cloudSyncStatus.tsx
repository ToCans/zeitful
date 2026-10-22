// Icon Imports
import { IconContext } from "react-icons";
import { PiCloudSlash, PiCloudCheck } from "react-icons/pi";
// Store Imports
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useCloudStore } from "../../../stores/useCloudStore";

const CloudSyncStatusTile = () => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const useCloudDatabase = useSettingsStore(
    (state) => state.appSettings.useCloudDatabase,
  );
  const cloudDatabase = useCloudStore((state) => state.cloudDatabase);

  const iconClassName = `${darkMode ? "fill-gray-200" : "fill-gray-600"} size-6 custom-target-icon`;

  const isCloudDisconnected = useCloudDatabase && !cloudDatabase;

  return (
    <IconContext.Provider value={{ className: iconClassName }}>
      {isCloudDisconnected ? <PiCloudSlash /> : <PiCloudCheck />}
    </IconContext.Provider>
  );
};

export default CloudSyncStatusTile;
