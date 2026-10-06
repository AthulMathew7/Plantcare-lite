import * as SQLite from 'expo-sqlite';
import diseaseInfo from '../constants/diseaseInfo';
import {
  persistScanImage,
  generateThumbnail,
} from './imageStorage';

let db = null;
let dbInitPromise = null;
let activeLocalUserId = null;
let guestUserInitPromise = null;

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
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name     TEXT,
      email            TEXT,
      auth_provider_id TEXT,
      created_at       DATETIME DEFAULT (datetime('now')),
      updated_at       DATETIME
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS disease_info (
      class_name        TEXT PRIMARY KEY,
      display_name      TEXT NOT NULL,
      crop              TEXT,
      image             TEXT,
      description       TEXT NOT NULL,
      short_description TEXT,
      symptoms          TEXT,
      cause             TEXT,
      treatment         TEXT NOT NULL,
      prevention       TEXT,
      cure_status       TEXT,
      severity          TEXT NOT NULL DEFAULT 'medium'
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS scan_history (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id              INTEGER NOT NULL,
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
  const scanColumns = await database.getAllAsync('PRAGMA table_info(scan_history);');
  const scanColumnNames = new Set((scanColumns || []).map((column) => column.name));

  if (!scanColumnNames.has('model_version')) {
    await database.execAsync(
      "ALTER TABLE scan_history ADD COLUMN model_version TEXT NOT NULL DEFAULT 'legacy-unknown';",
    );
  }
  if (!scanColumnNames.has('image_thumbnail_path')) {
    await database.execAsync(
      'ALTER TABLE scan_history ADD COLUMN image_thumbnail_path TEXT;',
    );
  }
  if (!scanColumnNames.has('deleted_at')) {
    await database.execAsync(
      'ALTER TABLE scan_history ADD COLUMN deleted_at DATETIME;',
    );
  }

  const userColumns = await database.getAllAsync('PRAGMA table_info(users);');
  const userColumnNames = new Set((userColumns || []).map((column) => column.name));
  if (!userColumnNames.has('email')) {
    await database.execAsync('ALTER TABLE users ADD COLUMN email TEXT;');
  }
  if (!userColumnNames.has('auth_provider_id')) {
    await database.execAsync('ALTER TABLE users ADD COLUMN auth_provider_id TEXT;');
  }
  if (!userColumnNames.has('updated_at')) {
    await database.execAsync('ALTER TABLE users ADD COLUMN updated_at DATETIME;');
  }

  const diseaseColumns = await database.getAllAsync('PRAGMA table_info(disease_info);');
  const diseaseColumnNames = new Set((diseaseColumns || []).map((column) => column.name));
  const diseaseSchema = [
    ['crop', 'TEXT'],
    ['image', 'TEXT'],
    ['short_description', 'TEXT'],
    ['symptoms', 'TEXT'],
    ['cause', 'TEXT'],
    ['prevention', 'TEXT'],
    ['cure_status', 'TEXT'],
  ];

  for (const [columnName, columnType] of diseaseSchema) {
    if (!diseaseColumnNames.has(columnName)) {
      await database.execAsync(
        `ALTER TABLE disease_info ADD COLUMN ${columnName} ${columnType};`,
      );
    }
  }

  await database.execAsync(
    'CREATE UNIQUE INDEX IF NOT EXISTS users_auth_provider_id_unique ON users(auth_provider_id);',
  );
  await database.execAsync(
    "UPDATE scan_history SET model_version = 'legacy-unknown' WHERE model_version = 'mock-v0'",
  );
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

    for (const info of diseaseInfo) {
      await database.runAsync(
        `INSERT INTO disease_info (
          class_name, display_name, crop, image, description, short_description,
          symptoms, cause, treatment, prevention, cure_status, severity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(class_name) DO UPDATE SET
          display_name = excluded.display_name,
          crop = excluded.crop,
          image = excluded.image,
          description = excluded.description,
          short_description = excluded.short_description,
          symptoms = excluded.symptoms,
          cause = excluded.cause,
          treatment = excluded.treatment,
          prevention = excluded.prevention,
          cure_status = excluded.cure_status,
          severity = excluded.severity`,
        [
          info.class_name,
          info.display_name,
          info.crop,
          info.image,
          info.description,
          info.short_description,
          info.symptoms,
          info.cause,
          info.treatment,
          info.prevention,
          info.cure_status,
          info.severity,
        ],
      );
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
  let userId = null;
  try {
    const database = await getDatabase();
    userId = requireActiveLocalUserId();
    if (__DEV__) {
      console.log('[PlantCare][Database] SAVE SCAN:', {
        activeLocalUserId: userId,
        diseaseClass,
        confidence,
        imageUri,
      });
    }
    const persistedUri = await persistScanImage(imageUri);
    let thumbnailUri = null;
    try {
      thumbnailUri = await generateThumbnail(persistedUri);
    } catch (e) {
      console.warn('Could not generate thumbnail:', e);
    }

    const result = await database.runAsync(
      `INSERT INTO scan_history (user_id, image_path, image_thumbnail_path, disease_class, confidence, is_uncertain, model_version)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      userId, persistedUri, thumbnailUri, diseaseClass, confidence, isUncertain ? 1 : 0, modelVersion,
    );
    const insertedId = result.lastInsertRowId;
    if (!Number.isInteger(insertedId)) {
      throw new Error('Database did not return the inserted scan ID.');
    }

    // If sync is enabled, queue this scan for future upload.
    const syncEnabled = await getSyncPreference();
    if (syncEnabled) {
      await database.runAsync(
        `INSERT INTO sync_queue (scan_id, attempt_count, last_attempt_at)
         VALUES (?, 0, NULL)`,
        insertedId,
      );
    }
    const savedScan = {
      id: insertedId,
      userId,
      imageUri: persistedUri,
      diseaseClass,
      confidence,
      isUncertain,
      modelVersion,
    };
    if (__DEV__) {
      console.log('[PlantCare][Database] SAVE SCAN SUCCESS:', {
        insertedId,
        userId,
      });
    }
    return savedScan;
  } catch (err) {
    if (__DEV__) {
      console.error('[PlantCare][Database] SAVE SCAN ERROR:', {
        activeLocalUserId: userId,
        message: err.message || String(err),
      });
    }
    throw new Error(`Could not save scan: ${err.message || err}`);
  }
}

export async function setHistoryItemUncertain(id, isUncertain) {
  const database = await getDatabase();
  try {
    const userId = requireActiveLocalUserId();
    await database.runAsync(
      'UPDATE scan_history SET is_uncertain = ? WHERE id = ? AND user_id = ?',
      isUncertain ? 1 : 0,
      id,
      userId,
    );
  } catch (err) {
    throw new Error(`Could not update scan: ${err.message || err}`);
  }
}

export async function loadHistory() {
  const database = await getDatabase();
  try {
    const userId = requireActiveLocalUserId();
    const query = `SELECT s.*, d.display_name AS display_name
       FROM scan_history s
       LEFT JOIN disease_info d ON d.class_name = s.disease_class
       WHERE s.deleted_at IS NULL AND s.user_id = ?
       ORDER BY s.scanned_at DESC`;
    console.log('[PlantCare][Database] HISTORY QUERY:', {
      activeLocalUserId: userId,
      query,
    });
    const rows = await database.getAllAsync(
      query,
      userId,
    );
    console.log('[PlantCare][Database] HISTORY ROW COUNT:', rows.length);
    return rows;
  } catch (err) {
    console.error('[PlantCare][Database] HISTORY QUERY FAILED:', err.message || err);
    throw new Error(`Could not load history: ${err.message || err}`);
  }
}

export async function deleteHistoryItem(id) {
  const database = await getDatabase();
  try {
    const userId = requireActiveLocalUserId();
    await database.runAsync(
      "UPDATE scan_history SET deleted_at = datetime('now') WHERE id = ? AND user_id = ?",
      id, userId,
    );
  } catch (err) {
    throw new Error(`Could not delete scan: ${err.message || err}`);
  }
}

export async function restoreHistoryItem(id) {
  const database = await getDatabase();
  try {
    const userId = requireActiveLocalUserId();
    await database.runAsync(
      'UPDATE scan_history SET deleted_at = NULL WHERE id = ? AND user_id = ?',
      id, userId,
    );
  } catch (err) {
    throw new Error(`Could not restore scan: ${err.message || err}`);
  }
}

export async function clearAllHistory() {
  const database = await getDatabase();
  try {
    const userId = requireActiveLocalUserId();
    await database.runAsync(
      "UPDATE scan_history SET deleted_at = datetime('now') WHERE deleted_at IS NULL AND user_id = ?",
      userId,
    );
  } catch (err) {
    throw new Error(`Could not clear history: ${err.message || err}`);
  }
}

export async function getSyncQueue() {
  const database = await getDatabase();
  try {
    const userId = requireActiveLocalUserId();
    return await database.getAllAsync(
      `SELECT q.*, s.image_path, s.image_thumbnail_path, s.disease_class, s.confidence
       FROM sync_queue q
       INNER JOIN scan_history s ON s.id = q.scan_id
       WHERE s.deleted_at IS NULL AND s.user_id = ?`,
      userId,
    );
  } catch (err) {
    throw new Error(`Could not load sync queue: ${err.message || err}`);
  }
}

function requireActiveLocalUserId() {
  if (activeLocalUserId === null) {
    throw new Error('No authenticated local user is active.');
  }
  return activeLocalUserId;
}

export function getActiveLocalUserId() {
  return activeLocalUserId;
}

export async function activateGuestLocalUser() {
  if (activeLocalUserId !== null) return activeLocalUserId;
  if (guestUserInitPromise) return guestUserInitPromise;

  guestUserInitPromise = (async () => {
    const database = await getDatabase();
    let guestUserId = null;

    await database.withTransactionAsync(async () => {
      const setting = await database.getFirstAsync(
        "SELECT value FROM app_settings WHERE key = 'guest_user_id'",
      );
      if (setting?.value) {
        const storedGuest = await database.getFirstAsync(
          'SELECT id FROM users WHERE id = ? AND auth_provider_id IS NULL',
          Number(setting.value),
        );
        if (storedGuest) {
          guestUserId = storedGuest.id;
          return;
        }
      }

      const legacyGuest = await database.getFirstAsync(
        'SELECT id FROM users WHERE id = 1 AND auth_provider_id IS NULL',
      );
      if (legacyGuest) {
        guestUserId = legacyGuest.id;
      } else {
        const result = await database.runAsync(
          "INSERT INTO users (display_name) VALUES ('Guest')",
        );
        guestUserId = result.lastInsertRowId;
      }

      await database.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('guest_user_id', ?)`,
        String(guestUserId),
      );
    });

    if (!guestUserId) {
      throw new Error('Could not initialize the local guest profile.');
    }
    activeLocalUserId = guestUserId;
    console.log('[PlantCare][Auth] ACTIVE GUEST LOCAL USER:', guestUserId);
    return guestUserId;
  })().finally(() => {
    guestUserInitPromise = null;
  });

  return guestUserInitPromise;
}

export function clearActiveLocalUser() {
  activeLocalUserId = null;
}

export async function getLocalAccountStatus(authUser) {
  if (!authUser?.uid || !authUser.email) {
    throw new Error('A verified authentication account is required.');
  }

  const database = await getDatabase();
  const linkedUser = await database.getFirstAsync(
    'SELECT id, display_name, email FROM users WHERE auth_provider_id = ?',
    authUser.uid,
  );
  if (linkedUser) {
    return { linked: true, localUser: linkedUser };
  }

  const legacyUser = await database.getFirstAsync(
    'SELECT id, display_name FROM users WHERE id = 1 AND auth_provider_id IS NULL',
  );
  if (!legacyUser) {
    return { linked: false, legacyScanCount: 0 };
  }

  const scanCount = await database.getFirstAsync(
    'SELECT COUNT(*) AS count FROM scan_history WHERE user_id = ?',
    legacyUser.id,
  );
  return {
    linked: false,
    legacyScanCount: scanCount?.count || 0,
  };
}

export async function linkLocalUserToAuthAccount(authUser, importLegacyData = false) {
  if (!authUser?.uid || !authUser.email) {
    throw new Error('A verified authentication account is required.');
  }

  const database = await getDatabase();
  const fallbackDisplayName = authUser.displayName || authUser.email.split('@')[0];
  let localUser;

  await database.withTransactionAsync(async () => {
    const linkedUser = await database.getFirstAsync(
      'SELECT id, display_name, email FROM users WHERE auth_provider_id = ?',
      authUser.uid,
    );

    if (linkedUser) {
      const displayName = authUser.displayName || linkedUser.display_name || fallbackDisplayName;
      await database.runAsync(
        "UPDATE users SET display_name = ?, email = ?, updated_at = datetime('now') WHERE id = ?",
        displayName, authUser.email, linkedUser.id,
      );
      localUser = { ...linkedUser, display_name: displayName, email: authUser.email };
      return;
    }

    if (importLegacyData) {
      const legacyUser = await database.getFirstAsync(
        'SELECT id, display_name FROM users WHERE id = 1 AND auth_provider_id IS NULL',
      );
      if (!legacyUser) {
        throw new Error('The existing local profile is no longer available to import.');
      }
      const displayName = authUser.displayName || legacyUser.display_name || fallbackDisplayName;
      await database.runAsync(
        "UPDATE users SET display_name = ?, email = ?, auth_provider_id = ?, updated_at = datetime('now') WHERE id = ?",
        displayName, authUser.email, authUser.uid, legacyUser.id,
      );
      localUser = { id: legacyUser.id, display_name: displayName, email: authUser.email };
      return;
    }

    const result = await database.runAsync(
      `INSERT INTO users (display_name, email, auth_provider_id, updated_at)
       VALUES (?, ?, ?, datetime('now'))`,
      fallbackDisplayName, authUser.email, authUser.uid,
    );
    localUser = {
      id: result.lastInsertRowId,
      display_name: fallbackDisplayName,
      email: authUser.email,
    };
  });

  if (!localUser?.id) {
    throw new Error('Could not establish a local profile for this account.');
  }
  activeLocalUserId = localUser.id;
  console.log('[PlantCare][Auth] ACTIVE FIREBASE LOCAL USER:', {
    localUserId: localUser.id,
    providerUserId: authUser.uid,
  });
  return localUser;
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
