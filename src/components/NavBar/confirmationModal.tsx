import { useEffect, useState } from "react";
import { useSettingsStore } from "../../stores/useSettingsStore";

interface ConfirmationModalProps {
  setShowConfirm: (show: boolean) => void;
  confirmNavigation: () => void;
}

const ConfirmationModal = ({
  setShowConfirm,
  confirmNavigation,
}: ConfirmationModalProps) => {
  const darkMode = useSettingsStore((state) => state.appSettings.darkMode);
  const [isMounted, setIsMounted] = useState(false);

  // Animate on mount
  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`fixed inset-0 ${darkMode ? "bg-zinc-800" : "bg-zinc-500"} bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-out ${
        isMounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`${darkMode ? "bg-zinc-700" : "bg-white"} rounded-lg p-6 max-w-sm mx-4 shadow-xl transition-all duration-300 ${
          isMounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h3
          className={`${darkMode ? "text-zinc-100" : "text-zinc-700"} text-lg font-semibold mb-2`}
        >
          Switch to Settings?
        </h3>
        <p className={`${darkMode ? "text-zinc-100" : "text-zinc-700"} mb-6`}>
          This will reset and stop the current timer. Do you want to continue?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowConfirm(false)}
            className={`px-4 py-2 rounded ${darkMode ? "bg-zinc-500 hover:bg-zinc-600" : "bg-gray-200 hover:bg-gray-300"} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={confirmNavigation}
            className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
