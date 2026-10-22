// API Imports
import { sendTimerWorkerMessage } from "../../pages/timer/api/timer-controls";
// Component Imports
import ActiveNavBarUnderline from "./activeNavBarUnderline";
import ConfirmationModal from "./confirmationModal";
// Context Imports
import { IconContext } from "react-icons";
// Icon Imports
import {
  PiClockCountdown,
  PiChartBar,
  PiUserCircle,
  PiGear,
} from "react-icons/pi";
// React Imports
import { useState } from "react";
// Store Imports
import { useNavigationStore } from "../../stores/useNavigationStore";
import { useTimerStore } from "../../stores/useTimerStore";
import { useRefsStore } from "../../stores/useRefsStore";
// Type Imports
import type { Page } from "../../types/types";

// Component Definition
const NavBar = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  // Zustand stores
  const activePage = useNavigationStore((state) => state.activePage);
  const setActivePage = useNavigationStore((state) => state.setActivePage);
  const timerRunning = useTimerStore((state) => state.timerRunning);
  const setTimerRunning = useTimerStore((state) => state.setTimerRunning);
  const timerWorker = useRefsStore((state) => state.timerWorker);

  // Handle Settings Click with Confirmation
  const handleSettingsClick = () => {
    if (timerRunning) {
      setShowConfirm(true);
    } else {
      confirmSettingsNavigation();
    }
  };

  // Confirm Settings Navigation
  const confirmSettingsNavigation = () => {
    togglePage("Settings");
    setTimerRunning(false);
    sendTimerWorkerMessage({
      timerWorker: timerWorker,
      runningBoolean: false,
      timeRemaining: null,
    });
    setShowConfirm(false);
  };

  // Toggle Page Functionality
  const togglePage = (targetPage: Page) => {
    setActivePage(activePage !== targetPage ? targetPage : "Timer");
  };

  // Nav items configuration
  const navItems = [
    { page: "Timer" as Page, icon: PiClockCountdown, label: "Timer" },
    { page: "Statistics" as Page, icon: PiChartBar, label: "Statistics" },
    { page: "UserPage" as Page, icon: PiUserCircle, label: "User Page" },
    { page: "Settings" as Page, icon: PiGear, label: "Settings" },
  ];

  return (
    <div>
      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmationModal
          setShowConfirm={setShowConfirm}
          confirmNavigation={confirmSettingsNavigation}
        />
      )}

      <div className="flex flex-col absolute bottom-0 w-full justify-center items-center min-h-14">
        <div className="relative flex flex-row justify-center rounded-t-lg inset-shadow-md gap-2 p-2">
          {navItems.map(({ page, icon: Icon, label }) => (
            <div key={page} className="flex flex-col items-center">
              <IconContext.Provider
                value={{
                  className: `size-10 transition-opacity cursor-pointer ${
                    activePage === page
                      ? "opacity-70"
                      : "opacity-50 hover:opacity-85"
                  }`,
                }}
              >
                <Icon
                  onClick={() => {
                    if (page === "Settings") {
                      handleSettingsClick();
                    } else {
                      togglePage(page);
                    }
                  }}
                  aria-label={label}
                />
              </IconContext.Provider>
              <ActiveNavBarUnderline active={activePage === page} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
