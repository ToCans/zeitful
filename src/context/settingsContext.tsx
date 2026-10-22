// React Imports
import React from "react";
// Type Imports
import type { SettingsContextType } from "../types/context";

// Context Definition
const SettingsContext = React.createContext<SettingsContextType | null>(null);

export default SettingsContext;
