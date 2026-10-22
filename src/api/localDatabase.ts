// Library Imports
import initSqlJs from "sql.js";
// Type Imports
import type { Database } from "sql.js";
import type {
  Action,
  DatabaseActionResponse,
  EditedWorkTask,
  EditedWorkTopic,
  WorkTask,
  WorkTaskStatus,
  WorkTopic,
  WorkEntry,
  CloudDatabaseData,
} from "../types/types";

// Consts
let dbInstance: Database | null = null;

// Overall Local Database Functions
// Get Database from Local Memory
export async function getLocalDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs({
    locateFile: (file: string) => `/sqljs/${file}`,
  });

  const saved = localStorage.getItem("zeitful_db");

  if (saved) {
    const binary = atob(saved);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    dbInstance = new SQL.Database(bytes);
  } else {
    dbInstance = new SQL.Database();
  }

  createTables(dbInstance);

  return dbInstance;
}

// Create the Local Database
function createTables(db: Database) {
  db.run(`
     CREATE TABLE IF NOT EXISTS work_topics (
		id BLOB(16) PRIMARY KEY, -- UUID as 16-byte BLOB
		name TEXT NOT NULL,
		color INTEGER NOT NULL, -- 0xRRGGBB stored as INTEGER
		last_action INTEGER, -- 1=Added, 2=Edited, 3=Deleted
		last_action_date TEXT
	);

	CREATE TABLE IF NOT EXISTS work_tasks (
		id BLOB(16) PRIMARY KEY, -- UUID
		topic_id BLOB(16),
		name TEXT NOT NULL,
		status INTEGER NOT NULL CHECK(status IN (1,2,3)), -- 1=Open, 2=Active, 3=Closed
		last_action INTEGER, -- same enum as above
		last_action_date TEXT
	);

	CREATE TABLE IF NOT EXISTS work_entries (
		id BLOB(16) PRIMARY KEY, -- UUID
		task_id BLOB(16),
		topic_id BLOB(16),
		task_name TEXT,
		topic_name TEXT,
		duration REAL NOT NULL, -- minutes
		completion_time TEXT NOT NULL
	);
  `);
}

export async function saveLocalDatabase() {
  if (!dbInstance) {
    console.warn("No database instance to save");
    return;
  }

  const data = dbInstance.export();

  // Convert to base64 in chunks to avoid stack overflow on Safari/iOS
  const chunkSize = 8192; // Process 8KB at a time
  let binary = "";

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  localStorage.setItem("zeitful_db", btoa(binary));
}

// Gathers all of the local database data from each table
export async function getLocalDatabaseData() {
  const db = await getLocalDatabase();

  function queryAll(sql: string) {
    const stmt = db.prepare(sql);
    const rows: Record<string, any>[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  const topics = queryAll(`SELECT * FROM work_topics`);
  const tasks = queryAll(`SELECT * FROM work_tasks`);
  const workEntries = queryAll(`SELECT * FROM work_entries`);

  return { topics, tasks, workEntries };
}

// Converts the database to a downloadable json file
export async function downloadDataJson() {
  try {
    const data = await getLocalDatabaseData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zeitful_data.json";
    a.click();
    URL.revokeObjectURL(url);
    return {
      status: "Success",
      message: `Data was successfully downloaded.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Data wasn't downloaded successfully. ${e}`,
    };
  }
}

// Import JSON data back into the database
export async function updateLocalDatabaseFromJson(jsonData: CloudDatabaseData) {
  try {
    const db = await getLocalDatabase();

    // --- Upsert for topics ---
    const upsertTopic = db.prepare(`
      INSERT INTO work_topics (id, name, color, last_action, last_action_date) 
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        color = excluded.color,
        last_action = excluded.last_action,
        last_action_date = excluded.last_action_date
      WHERE excluded.last_action_date > work_topics.last_action_date
    `);

    for (const t of jsonData.topics || []) {
      upsertTopic.run([
        t.id,
        t.name,
        t.color,
        t.last_action,
        t.last_action_date ?? new Date().toISOString(),
      ]);
    }
    upsertTopic.free();

    // --- Upsert for tasks ---
    const upsertTask = db.prepare(`
      INSERT INTO work_tasks (id, topic_id, name, status, last_action, last_action_date)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        topic_id = excluded.topic_id,
        name = excluded.name,
        status = excluded.status,
        last_action = excluded.last_action,
        last_action_date = excluded.last_action_date
      WHERE excluded.last_action_date > work_tasks.last_action_date
    `);

    for (const t of jsonData.tasks || []) {
      upsertTask.run([
        t.id,
        t.topic_id,
        t.name,
        t.status,
        t.last_action,
        t.last_action_date ?? new Date().toISOString(),
      ]);
    }
    upsertTask.free();

    // --- Upsert for work entries (always overwrite) ---
    const upsertEntry = db.prepare(`
      INSERT INTO work_entries (id, task_id, topic_id, task_name, topic_name, duration, completion_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        task_id = excluded.task_id,
        topic_id = excluded.topic_id,
        task_name = excluded.task_name,
        topic_name = excluded.topic_name,
        duration = excluded.duration,
        completion_time = excluded.completion_time
    `);

    for (const e of jsonData.workEntries || []) {
      upsertEntry.run([
        e.id,
        e.task_id ?? null,
        e.topic_id ?? null,
        e.task_name ?? null,
        e.topic_name ?? null,
        e.duration ?? 10,
        e.completion_time ?? new Date().toISOString(),
      ]);
    }
    upsertEntry.free();
    await saveLocalDatabase();
  } catch (e) {
    console.log("Failed to import data into local database. Error:", e);
  }
}

// Imports Database Data from Json File
export async function importLocalDatabaseDataFromJson(file: File) {
  try {
    const text = await file.text();
    const jsonData = JSON.parse(text);
    console.log(jsonData);
    await updateLocalDatabaseFromJson(jsonData);
    return {
      status: "Success",
      message: `Data was successfully imported.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Data wasn't imported successfully. ${e}`,
    };
  }
}

// Local Database Functions for Tasks
// Adding Task to local database
export async function addTask(task: WorkTask): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();

    // Check if topic already exists
    const existing = db.exec(
      'SELECT * FROM work_tasks WHERE name = "' +
        task.name.replace(/"/g, '""') +
        '"',
    );

    if (existing.length > 0) {
      return {
        status: "Failure",
        message: `Take "${task.name}" already exists — skipping insert.`,
      };
    }

    db.run(
      `INSERT INTO work_tasks (id, topic_id, name, status, last_action, last_action_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task?.topic_id ?? null,
        task.name,
        1,
        1,
        task?.last_action_date,
      ],
    );

    await saveLocalDatabase();

    return {
      status: "Success",
      message: `Task "${task.name}" inserted into database.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Task "${task.name}" wasn't inserted into database. ${e}`,
    };
  }
}

// Editing task in local database
export async function editTask(
  taskId: string,
  workTask: EditedWorkTask,
): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();

    // Check if task exists
    const existing = db.exec(
      `SELECT * FROM work_tasks WHERE id = "${taskId.replace(/"/g, '""')}"`,
    );

    if (existing.length === 0) {
      return {
        status: "Failure",
        message: `Task with id "${taskId}" not found — cannot update.`,
      };
    }

    db.run(
      `UPDATE work_tasks
             SET topic_id = ?, 
                 name = ?, 
                 status = ?, 
                 last_action = ?,
				 last_action_date = ?
             WHERE id = ?`,
      [
        workTask.topic_id ?? null,
        workTask.name,
        workTask.status,
        2,
        workTask.last_action_date,
        taskId,
      ],
    );

    await saveLocalDatabase();

    return {
      status: "Success",
      message: `Task "${workTask.name}" was updated.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Task "${workTask.name}" wasn't updated. ${e}`,
    };
  }
}

// Deleting Task in local database
export async function deleteTask(
  taskId: string,
  task: WorkTask,
  last_action_date: string,
): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();

    // Check if task exists
    const existing = db.exec(
      `SELECT * FROM work_tasks WHERE id = "${taskId.replace(/"/g, '""')}"`,
    );

    if (existing.length === 0) {
      return {
        status: "Failure",
        message: `Task with id "${taskId}" not found — cannot delete.`,
      };
    }

    db.run(
      `UPDATE work_tasks
             SET last_action = ?,
				last_action_date = ?
             WHERE id = ?`,
      [3, last_action_date, taskId],
    );

    await saveLocalDatabase();

    return {
      status: "Success",
      message: `Task "${task.name}" was deleted.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Task "${task.name}" wasn't deleted. ${e}`,
    };
  }
}

export async function getTasks(): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();
    const res = db.exec(`
            SELECT t.id, t.topic_id, t.name, t.status, t.last_action, t.last_action_date
            FROM work_tasks t
        `);

    if (res.length === 0)
      return {
        status: "Success",
        message: `No tasks available in local database.`,
        item: [],
      };

    const localWorkTasks = res[0].values.map(
      ([id, topic_id, name, status, last_action, last_action_date]) => ({
        id: id as string,
        topic_id: topic_id as string | null,
        name: name as string,
        status: status as WorkTaskStatus,
        last_action: last_action as Action,
        last_action_date: last_action_date as string,
      }),
    );

    return {
      status: "Success",
      message: `Local tasks available in local database.`,
      item: localWorkTasks,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Couldn't retrieve work tasks from local database. ${e}`,
    };
  }
}

// Local Database Functions for Topics
// Adding Topic to local database
export async function addTopic(
  topic: WorkTopic,
): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();

    // Check if topic already exists
    const existing = db.exec(
      'SELECT * FROM work_topics WHERE name = "' +
        topic.name.replace(/"/g, '""') +
        '"',
    );

    if (existing.length > 0) {
      return {
        status: "Failure",
        message: `Topic "${topic.name}" already exists — skipping insert.`,
      };
    }

    // If not found, insert new
    db.run(
      `INSERT INTO work_topics 
			(id, name, color, last_action, last_action_date) 
			VALUES (?, ?, ?, ?, ?)`,
      [topic.id, topic.name, topic.color, 1, topic.last_action_date],
    );

    await saveLocalDatabase();
    return {
      status: "Success",
      message: `Topic "${topic.name}" inserted into database.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Topic "${topic.name}" wasn't inserted into database. ${e}`,
    };
  }
}

// Editing topic in local database
export async function editTopic(
  topicId: string,
  workTopic: EditedWorkTopic,
): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();

    // Check if task exists
    const existing = db.exec(
      `SELECT * FROM work_topics WHERE id = "${topicId.replace(/"/g, '""')}"`,
    );

    if (existing.length === 0) {
      return {
        status: "Failure",
        message: `Task with id "${topicId}" not found — cannot update.`,
      };
    }

    db.run(
      `UPDATE work_topics
			SET 
				name = ?, 
				color = ?,
				last_action = ?,
				last_action_date = ?
			WHERE id = ?`,
      [
        workTopic.name,
        workTopic.color,
        workTopic.last_action,
        workTopic.last_action_date,
        topicId,
      ],
    );

    await saveLocalDatabase();

    return {
      status: "Success",
      message: `Topic "${workTopic.name}" was updated.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Topic "${workTopic.name}" wasn't updated. ${e}`,
    };
  }
}

// Deleting Task in local database ()
export async function deleteTopic(
  topicId: string,
  topic: WorkTopic,
  last_action_date: string,
): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();

    // Check if task exists
    const existing = db.exec(
      `SELECT * FROM work_topics WHERE id = "${topicId.replace(/"/g, '""')}"`,
    );

    if (existing.length === 0) {
      return {
        status: "Failure",
        message: `Task with id "${topicId}" not found — cannot delete.`,
      };
    }

    db.run(
      `UPDATE work_topics
             SET last_action = ?,
			 	last_action_date = ?
             WHERE id = ?`,
      [3, last_action_date, topicId],
    );

    await saveLocalDatabase();

    return {
      status: "Success",
      message: `Topic "${topic.name}" was deleted.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Topic "${topic.name}" wasn't deleted. ${e}`,
    };
  }
}

export async function getTopics(): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();
    const res = db.exec(`
            SELECT t.id, t.name, t.color, t.last_action
            FROM work_topics t
        `);

    if (res.length === 0)
      return {
        status: "Success",
        message: `No tasks available in local database.`,
        item: [],
      };

    const localWorkTopics = res[0].values.map(
      ([id, name, color, last_action, last_action_date]) => ({
        id: id as string,
        name: name as string,
        color: color as number,
        last_action: last_action as Action,
        last_action_date: last_action_date as string,
      }),
    );

    return {
      status: "Success",
      message: `Local topics available in local database.`,
      item: localWorkTopics,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Couldn't retrieve work topics from local database. ${e}`,
    };
  }
}

// Work Entires
export async function addWorkEntry(
  workEntry: WorkEntry,
): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();
    db.run(
      `INSERT INTO work_entries 
        (id, task_id, topic_id, task_name, topic_name, duration, completion_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        workEntry.id,
        workEntry.task_id,
        workEntry.topic_id,
        workEntry.task_name,
        workEntry.topic_name,
        workEntry.duration,
        workEntry.completion_time,
      ],
    );
    await saveLocalDatabase();
    return {
      status: "Success",
      message: `Work Entry inserted into database.`,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Work Entry wasn't inserted into database. ${e}`,
    };
  }
}

export async function getWorkEntries(): Promise<DatabaseActionResponse> {
  try {
    const db = await getLocalDatabase();
    const res = db.exec(`
    SELECT t.id, t.task_id, t.topic_id, t.task_name, t.topic_name, t.duration, t.completion_time
    FROM work_entries t
  `);

    if (res.length === 0)
      return {
        status: "Success",
        message: `No work entries available in local database.`,
        item: [],
      };
    const localWorkEntries = res[0].values.map(
      ([
        id,
        task_id,
        topic_id,
        task_name,
        topic_name,
        duration,
        completion_time,
      ]) => ({
        id: id as string,
        task_id: task_id as string | null,
        topic_id: topic_id as string | null,
        task_name: task_name as string | null,
        topic_name: topic_name as string | null,
        duration: duration as number,
        completion_time: completion_time as string,
      }),
    );

    return {
      status: "Success",
      message: `Local entries available in local database.`,
      item: localWorkEntries,
    };
  } catch (e) {
    return {
      status: "Failure",
      message: `Work Entry wasn't inserted into database. ${e}`,
    };
  }
}
