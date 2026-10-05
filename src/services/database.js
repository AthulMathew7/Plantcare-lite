import * as SQLite from 'expo-sqlite';
import diseaseInfo from '../constants/diseaseInfo';
import {
  persistScanImage,
  generateThumbnail,
} from './imageStorage';

let db = null;
let dbInitPromise = null;

/**
 * Opens (or returns existing) the SQLite database and ensures all tables
 * exist. Seeds disease_info and default user on first launch. Concurrent callers share one init.
 */
export async function getDatabase() {
  if (db) return db;
  if (!dbInitPromise) {
    dbInitPromise = initializeDatabase().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

async function initializeDatabase() {
  const database = await SQLite.openDatabaseAsync('plantcare.db');
  try {
    await database.execAsync('PRAGMA foreign_keys = ON;');
    await createTables(database);
    await migrateDatabase(database);
    await seedDatabase(database);
    db = database;
    return db;
  } catch (err) {
    db = null;
    throw new Error(`Database initialization failed: ${err.message || err}`);
  }
}

async function createTables(database) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name TEXT,
      created_at   DATETIME DEFAULT (datetime('now'))
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS disease_info (
      class_name   TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      description  TEXT NOT NULL,
      treatment    TEXT NOT NULL,
      severity     TEXT NOT NULL DEFAULT 'medium'
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS scan_history (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id              INTEGER DEFAULT 1,
      image_path           TEXT NOT NULL,
      image_thumbnail_path TEXT,
      disease_class        TEXT NOT NULL,
      confidence           REAL NOT NULL,
      is_uncertain         BOOLEAN NOT NULL DEFAULT 0,
      scanned_at           DATETIME NOT NULL DEFAULT (datetime('now')),
      synced               BOOLEAN NOT NULL DEFAULT 0,
      model_version        TEXT NOT NULL DEFAULT 'plantcare-v1.0',
      deleted_at           DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (disease_class) REFERENCES disease_info(class_name)
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id         INTEGER NOT NULL,
      attempt_count   INTEGER NOT NULL DEFAULT 0,
      last_attempt_at DATETIME,
      FOREIGN KEY (scan_id) REFERENCES scan_history(id)
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

async function migrateDatabase(database) {
  try {
    const columns = await database.getAllAsync('PRAGMA table_info(scan_history);');
    const columnNames = new Set((columns || []).map((c) => c.name));

    if (!columnNames.has('model_version')) {
      await database.execAsync(
        "ALTER TABLE scan_history ADD COLUMN model_version TEXT NOT NULL DEFAULT 'legacy-unknown';",
      );
    }
    if (!columnNames.has('image_thumbnail_path')) {
      await database.execAsync(
        'ALTER TABLE scan_history ADD COLUMN image_thumbnail_path TEXT;',
      );
    }
    if (!columnNames.has('deleted_at')) {
      await database.execAsync(
        'ALTER TABLE scan_history ADD COLUMN deleted_at DATETIME;',
      );
    }
    await database.execAsync(
      "UPDATE scan_history SET model_version = 'legacy-unknown' WHERE model_version = 'mock-v0'",
    );
  } catch (err) {
    console.warn('Database migration warning:', err);
  }
}

async function seedDatabase(database) {
  await database.withTransactionAsync(async () => {
    // Check default user (id: 1)
    const userResult = await database.getFirstAsync(
      'SELECT COUNT(*) AS cnt FROM users WHERE id = 1',
    );
    if (!userResult || userResult.cnt === 0) {
      await database.runAsync(
        "INSERT INTO users (id, display_name) VALUES (1, 'Farmer')",
      );
    }

    // Check disease_info seed count
    const diseaseResult = await database.getFirstAsync(
      'SELECT COUNT(*) AS cnt FROM disease_info',
    );

    if (!diseaseResult || diseaseResult.cnt < diseaseInfo.length) {
      for (const info of diseaseInfo) {
        await database.runAsync(
          `INSERT OR REPLACE INTO disease_info (class_name, display_name, description, treatment, severity)
           VALUES (?, ?, ?, ?, ?)`,
          [info.class_name, info.display_name, info.description, info.treatment, info.severity],
        );
      }
    }
  });
}

export async function saveScanToHistory(
  imageUri,
  diseaseClass,
  confidence,
  isUncertain = false,
  modelVersion = 'plantcare-v1.0',
) {
  const database = await getDatabase();
  try {
    const persistedUri = await persistScanImage(imageUri);
    let thumbnailUri = null;
    try {
      thumbnailUri = await generateThumbnail(persistedUri);
    } catch (e) {
      console.warn('Could not generate thumbnail:', e);
    }

    const result = await database.runAsync(
      `INSERT INTO scan_history (image_path, image_thumbnail_path, disease_class, confidence, is_uncertain, model_version)
       VALUES (?, ?, ?, ?, ?, ?)`,
      persistedUri, thumbnailUri, diseaseClass, confidence, isUncertain ? 1 : 0, modelVersion,
    );
    const scanId = result.lastInsertRowId;

    // If sync is enabled, queue this scan for future upload.
    const syncEnabled = await getSyncPreference();
    if (syncEnabled) {
      await database.runAsync(
        `INSERT INTO sync_queue (scan_id, attempt_count, last_attempt_at)
         VALUES (?, 0, NULL)`,
        scanId,
      );
    }
  } catch (err) {
    throw new Error(`Could not save scan: ${err.message || err}`);
  }
}

export async function loadHistory() {
  const database = await getDatabase();
  try {
    return await database.getAllAsync(
      `SELECT s.*, d.display_name AS display_name
       FROM scan_history s
       LEFT JOIN disease_info d ON d.class_name = s.disease_class
       WHERE s.deleted_at IS NULL
       ORDER BY s.scanned_at DESC`,
    );
  } catch (err) {
    throw new Error(`Could not load history: ${err.message || err}`);
  }
}

export async function deleteHistoryItem(id) {
  const database = await getDatabase();
  try {
    await database.runAsync(
      "UPDATE scan_history SET deleted_at = datetime('now') WHERE id = ?",
      id,
    );
  } catch (err) {
    throw new Error(`Could not delete scan: ${err.message || err}`);
  }
}

export async function restoreHistoryItem(id) {
  const database = await getDatabase();
  try {
    await database.runAsync(
      'UPDATE scan_history SET deleted_at = NULL WHERE id = ?',
      id,
    );
  } catch (err) {
    throw new Error(`Could not restore scan: ${err.message || err}`);
  }
}

export async function clearAllHistory() {
  const database = await getDatabase();
  try {
    await database.runAsync(
      "UPDATE scan_history SET deleted_at = datetime('now') WHERE deleted_at IS NULL",
    );
  } catch (err) {
    throw new Error(`Could not clear history: ${err.message || err}`);
  }
}

export async function getSyncQueue() {
  const database = await getDatabase();
  try {
    return await database.getAllAsync(
      `SELECT q.*, s.image_path, s.image_thumbnail_path, s.disease_class, s.confidence
       FROM sync_queue q
       INNER JOIN scan_history s ON s.id = q.scan_id
       WHERE s.deleted_at IS NULL`,
    );
  } catch (err) {
    throw new Error(`Could not load sync queue: ${err.message || err}`);
  }
}

export async function lookupDiseaseInfo(diseaseClass) {
  const database = await getDatabase();
  try {
    return await database.getFirstAsync(
      'SELECT * FROM disease_info WHERE class_name = ?',
      diseaseClass,
    );
  } catch (err) {
    throw new Error(`Could not look up disease information: ${err.message || err}`);
  }
}

export async function getSyncPreference() {
  const database = await getDatabase();
  const row = await database.getFirstAsync(
    "SELECT value FROM app_settings WHERE key = 'sync_enabled'",
  );
  return row?.value === 'true';
}

export async function toggleSyncPreference(value) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('sync_enabled', ?)`,
    value ? 'true' : 'false',
  );
  return value;
}

export async function getOnboardingStatus() {
  const database = await getDatabase();
  const row = await database.getFirstAsync(
    "SELECT value FROM app_settings WHERE key = 'has_onboarded'",
  );
  return row?.value === '1';
}

export async function setOnboardingComplete() {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('has_onboarded', '1')`
  );
}

export async function getAllDiseases() {
  const database = await getDatabase();
  try {
    return await database.getAllAsync('SELECT * FROM disease_info');
  } catch (err) {
    throw new Error(`Could not load diseases: ${err.message || err}`);
  }
}
