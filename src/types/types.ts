// Type Defintions
export type Action = 1 | 2 | 3; // 1=Added, 2=Edited, 3=Deleted
export type DatabaseActionStatus = "Success" | "Failure";
export type Item = "Task" | "Topic" | "Entries";
export type Page = "Timer" | "Statistics" | "UserPage" | "Settings";
export type StatisticsTab = "Task" | "Topic";
export type TimePeriod = "W" | "M" | "Y";
export type WorkTaskStatus = 1 | 2 | 3; // 1=Open, 2=Active, 3=Closed

export type CloudDatabaseCredentials = {
  api_key: string;
  database_url: string;
};

export type CloudDatabaseData = {
  tasks: WorkTask[];
  topics: WorkTopic[];
  workEntries: WorkEntry[];
};

export type DatabaseActionResponse = {
  status: DatabaseActionStatus;
  message: string;
  item?: WorkTask[] | WorkTopic[] | WorkEntry[] | CloudDatabaseData;
};

export type DurationByTask = {
  [task_id: string]: number;
};

export type DurationByTopic = {
  [topic_id: string]: number;
};

export type PiChartData = {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
};

export type TaskData = {
  itemIds: string[];
  itemNames: string[];
  itemDurations: number[];
  itemColors: number[];
  topicPercentage?: number[];
};

export type TopicData = {
  itemIds: string[];
  itemNames: string[];
  itemDurations: number[];
  itemColors: number[];
  topicPercentage?: number[];
};

export interface PersistedAppSettings {
  showTabTimer: boolean;
  workingTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  timerColor: string;
  useCloudDatabase: boolean;
  lastCloudDatabaseSync: string;
  darkMode: boolean;
}

export interface PersistedTabSettings {
  lastUsedPeriodTab: TimePeriod;
  lastUsedStatisticsTab: StatisticsTab;
  lastUsedUserPageTab: Item;
  lastUsedVisualization: VisualizationType;
}

// Work Tasks //
export type EditedWorkTask = {
  topic_id: string | null;
  name: string;
  status: WorkTaskStatus;
  last_action: Action;
  last_action_date: string;
};

export type WorkTask = {
  id: string;
  topic_id: string | null;
  name: string;
  status: WorkTaskStatus;
  last_action: Action;
  last_action_date: string;
};

// Work Topics //
export type EditedWorkTopic = {
  name: string;
  color: number;
  last_action: Action;
  last_action_date: string;
};

export type WorkTopic = {
  id: string;
  name: string;
  color: number;
  last_action: Action;
  last_action_date: string;
};

// Work Entries //
export type WorkEntry = {
  id: string;
  task_id: WorkTask["id"] | null;
  topic_id: WorkTopic["id"] | null;
  task_name: WorkTask["name"] | null;
  topic_name: WorkTopic["name"] | null;
  duration: number;
  completion_time: string;
};

export type VisualizationType = "Pie" | "Heatmap";

// types.ts
export type HeatmapRow = {
  id: string;
  label: string;
  values: number[]; // one value per column
  total: number;
};

export type HeatmapData = {
  columns: string[];
  rows: HeatmapRow[];
  maxValue: number;
};
