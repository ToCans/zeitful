// Type Imports
import type {
  DatabaseActionResponse,
  EditedWorkTask,
  EditedWorkTopic,
  WorkTask,
  WorkEntry,
  WorkTopic,
  CloudDatabaseData,
} from "../types/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Get Data from Local Supabase connection
export async function getDataFromSupabaseDatabase(
  supabaseClient: SupabaseClient,
): Promise<DatabaseActionResponse> {
  try {
    const [
      { data: topics, error: topicsError },
      { data: tasks, error: tasksError },
      { data: workEntries, error: entriesError },
    ] = await Promise.all([
      supabaseClient.from("work_topics").select("*"),
      supabaseClient.from("work_tasks").select("*"),
      supabaseClient.from("work_entries").select("*"),
    ]);

    if (topicsError || tasksError || entriesError) {
      return {
        status: "Failure",
        message: `Data cannot be gathered from supabase database. Topics Error: ${topicsError}. Tasks Error: ${tasksError}. Entries Error: ${entriesError}.`,
      };
    }

    return {
      status: "Success",
      message: `Local entries available in local database.`,
      item: {
        tasks: tasks,
        topics: topics,
        workEntries: workEntries,
      } as CloudDatabaseData,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Data cannot be gathered from supabase database. Error ${e}.`,
    };
  }
}

// Filtering based on most recent last_action_date
async function filterNewerItems(
  supabaseClient: SupabaseClient,
  table: "work_topics" | "work_tasks",
  localItems: any[],
) {
  const ids = localItems.map((i) => i.id);
  const { data: remoteItems } = await supabaseClient
    .from(table)
    .select("id, last_action_date")
    .in("id", ids);

  if (!remoteItems) return localItems;

  // Keep only items that are newer
  return localItems.filter((localItem) => {
    const remoteItem = remoteItems.find((r) => r.id === localItem.id);
    if (!remoteItem) return true; // new item
    return (
      new Date(localItem.last_action_date) >
      new Date(remoteItem.last_action_date)
    );
  });
}

// Local Data Sync with supabase database
export async function syncLocalDataToSupabaseDatabase(
  supabaseClient: SupabaseClient,
  localData: any,
) {
  try {
    // 1️⃣ Filter topics & tasks based on last_action_date
    const filteredTopics = await filterNewerItems(
      supabaseClient,
      "work_topics",
      localData.topics,
    );
    const filteredTasks = await filterNewerItems(
      supabaseClient,
      "work_tasks",
      localData.tasks,
    );

    // 2️⃣ Upsert topics
    if (filteredTopics.length > 0) {
      const { error: topicsError } = await supabaseClient
        .from("work_topics")
        .upsert(filteredTopics, { onConflict: "id" });

      if (topicsError) throw topicsError;
    }

    // 3️⃣ Upsert tasks
    if (filteredTasks.length > 0) {
      const { error: tasksError } = await supabaseClient
        .from("work_tasks")
        .upsert(filteredTasks, { onConflict: "id" });

      if (tasksError) throw tasksError;
    }

    // 4️⃣ Upsert work_entries as before (no conditional update)
    const { error: entriesError } = await supabaseClient
      .from("work_entries")
      .upsert(localData.workEntries, { onConflict: "id" });

    if (entriesError) throw entriesError;

    return {
      status: "Success",
      message: `Local data synced to Supabase database.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Data could not be synced to supabase database. Error ${e}.`,
    };
  }
}

// Tries to import a json file as a database
export async function importCloudDatabaseCredentials(file: File) {
  try {
    const text = await file.text();
    const jsonData = JSON.parse(text);
    return {
      status: "Success",
      message: `Cloud Database credentials uploaded.`,
      cloudCredentials: jsonData,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Cloud Database credentials could not be uploaded. ${e}`,
    };
  }
}

// Sending individual Work Entry to Supabase Database
export const addWorkTaskSupabaseDatabase = async (
  supabaseClient: SupabaseClient,
  workTask: WorkTask,
): Promise<DatabaseActionResponse> => {
  try {
    const { error: entryError } = await supabaseClient
      .from("work_tasks")
      .upsert(workTask, { onConflict: "id" });

    if (entryError) {
      return {
        status: "Failure",
        message: `Work Topic wasn't inserted into supabase database. ${entryError}`,
      };
    }
    return {
      status: "Success",
      message: `Work Task inserted into supabase database.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Work Topic wasn't inserted into supabase database. ${e}`,
    };
  }
};

export const editWorkTaskSupabaseDatabase = async (
  supabaseClient: SupabaseClient,
  taskId: string,
  editedWorkTask: EditedWorkTask,
): Promise<DatabaseActionResponse> => {
  try {
    const { error } = await supabaseClient
      .from("work_tasks")
      .update({
        topic_id: editedWorkTask.topic_id,
        name: editedWorkTask.name,
        status: editedWorkTask.status,
        last_action: editedWorkTask.last_action,
        last_action_date: editedWorkTask.last_action_date,
      })
      .eq("id", taskId)
      .select(); // required to detect "not found"

    if (error) {
      return {
        status: "Failure",
        message: `Work Task wasn't updated in supabase database. ${error.message}`,
      };
    }

    return {
      status: "Success",
      message: `Work Task was updated in supabase database.`,
    };
  } catch (e: any) {
    return {
      status: "Failure",
      message: `Work Task wasn't updated in supabase database. ${e?.message ?? e}`,
    };
  }
};

export const deleteWorkTaskSupabaseDatabase = async (
  supabaseClient: SupabaseClient,
  taskId: string,
  task: WorkTask,
  last_action_date: string,
): Promise<DatabaseActionResponse> => {
  try {
    // Soft delete: set last_action = 3 and update last_action_date
    const { data, error } = await supabaseClient
      .from("work_tasks")
      .update({
        last_action: 3, // 3 = deleted
        last_action_date: last_action_date,
      })
      .eq("id", taskId)
      .select(); // required to detect "not found"

    if (error) {
      return {
        status: "Failure",
        message: `Task "${task.name}" wasn't deleted in supabase database. ${error.message}`,
      };
    }

    if (!data || data.length === 0) {
      return {
        status: "Failure",
        message: `Task with id "${taskId}" not found — cannot delete.`,
      };
    }

    return {
      status: "Success",
      message: `Task "${task.name}" was deleted in supabase database.`,
    };
  } catch (e: any) {
    return {
      status: "Failure",
      message: `Task "${task.name}" wasn't deleted in supabase database. ${e?.message ?? e}`,
    };
  }
};

// Sending individual Work Entry to Supabase Database
export const addWorkTopicSupabaseDatabase = async (
  supabaseClient: SupabaseClient,
  workTopic: WorkTopic,
): Promise<DatabaseActionResponse> => {
  try {
    const { error: entryError } = await supabaseClient
      .from("work_topics")
      .upsert(workTopic, { onConflict: "id" });

    if (entryError) {
      return {
        status: "Failure",
        message: `Work Topic wasn't inserted into supabase database. ${entryError}`,
      };
    }
    return {
      status: "Success",
      message: `Work Topic inserted into supabase database.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Work Topic wasn't inserted into supabase database. ${e}`,
    };
  }
};

export const editWorkTopicSupabaseDatabase = async (
  supabaseClient: SupabaseClient,
  topicId: string,
  editedWorkTopic: EditedWorkTopic,
): Promise<DatabaseActionResponse> => {
  try {
    const { data, error } = await supabaseClient
      .from("work_topics")
      .update({
        name: editedWorkTopic.name,
        color: editedWorkTopic.color,
        last_action: editedWorkTopic.last_action,
        last_action_date: editedWorkTopic.last_action_date,
      })
      .eq("id", topicId)
      .select(); // required to detect "not found"

    if (error) {
      return {
        status: "Failure",
        message: `Work Topic wasn't updated in supabase database. ${error.message}`,
      };
    }

    if (!data || data.length === 0) {
      return {
        status: "Failure",
        message: `Work Topic with id "${topicId}" not found — cannot update.`,
      };
    }

    return {
      status: "Success",
      message: `Work Topic updated in supabase database.`,
    };
  } catch (e: any) {
    return {
      status: "Failure",
      message: `Work Topic wasn't updated in supabase database. ${e?.message ?? e}`,
    };
  }
};

export const deleteWorkTopicSupabaseDatabase = async (
  supabaseClient: SupabaseClient,
  topicId: string,
  topic: WorkTopic,
  last_action_date: string,
): Promise<DatabaseActionResponse> => {
  try {
    // Perform "soft delete" by updating last_action and last_action_date
    const { data, error } = await supabaseClient
      .from("work_topics")
      .update({
        last_action: 3, // 3 = deleted
        last_action_date: last_action_date,
      })
      .eq("id", topicId)
      .select(); // required to detect "not found"

    if (error) {
      return {
        status: "Failure",
        message: `Topic "${topic.name}" wasn't deleted in supabase database. ${error.message}`,
      };
    }

    if (!data || data.length === 0) {
      return {
        status: "Failure",
        message: `Topic with id "${topicId}" not found — cannot delete.`,
      };
    }

    return {
      status: "Success",
      message: `Topic "${topic.name}" was deleted in supabase database.`,
    };
  } catch (e: any) {
    return {
      status: "Failure",
      message: `Topic "${topic.name}" wasn't deleted in supabase database. ${e?.message ?? e}`,
    };
  }
};

// Adding individual Work Entry to Supabase Database
export const addWorkEntrySupabaseDatabase = async (
  supabaseClient: SupabaseClient,
  workEntry: WorkEntry,
): Promise<DatabaseActionResponse> => {
  try {
    const { error: entryError } = await supabaseClient
      .from("work_entries")
      .upsert(workEntry, { onConflict: "id" });

    if (entryError) {
      return {
        status: "Failure",
        message: `Work Entry wasn't inserted into supabase database. ${entryError}`,
      };
    }
    return {
      status: "Success",
      message: `Work Entry inserted into supabase database.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Work Entry wasn't inserted into supabase database. ${e}`,
    };
  }
};
