import diseaseInfo from '../src/constants/diseaseInfo';

// Mock expo-sqlite async interface
jest.mock('expo-sqlite', () => {
  const mockDb = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    withTransactionAsync: jest.fn(async (cb) => {
      await cb();
    }),
  };

  return {
    openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
  };
});

describe('Database migrations and features verification', () => {
  let SQLite;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies fresh installation initializes all tables and new columns', async () => {
    const executedSql = [];
    const mockDatabase = {
      execAsync: jest.fn(async (sql) => {
        executedSql.push(sql);
      }),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
      getFirstAsync: jest.fn().mockResolvedValue({ cnt: 0 }),
      getAllAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('table_info(scan_history)')) {
          // Fresh install: already has all columns from createTables
          return Promise.resolve([
            { name: 'id' },
            { name: 'image_path' },
            { name: 'image_thumbnail_path' },
            { name: 'disease_class' },
            { name: 'confidence' },
            { name: 'is_uncertain' },
            { name: 'scanned_at' },
            { name: 'synced' },
            { name: 'model_version' },
            { name: 'deleted_at' },
          ]);
        }
        return Promise.resolve([]);
      }),
      withTransactionAsync: jest.fn(async (cb) => {
        await cb();
      }),
    };

    await jest.isolateModules(async () => {
      const sqliteModule = require('expo-sqlite');
      sqliteModule.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);
      const dbModule = require('../src/services/database');

      const db = await dbModule.getDatabase();
      expect(db).toBe(mockDatabase);
      expect(mockDatabase.execAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON;');
      expect(executedSql.some((s) => s.includes('scan_history') && s.includes('model_version'))).toBe(true);
    });
  });

  it('verifies migration against an existing database missing new columns', async () => {
    const alteredColumns = [];
    const mockDatabase = {
      execAsync: jest.fn(async (sql) => {
        if (sql.includes('ALTER TABLE scan_history ADD COLUMN')) {
          alteredColumns.push(sql);
        }
      }),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
      getFirstAsync: jest.fn().mockResolvedValue({ cnt: 1 }), // already seeded
      getAllAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('table_info(scan_history)')) {
          // Legacy database without new columns
          return Promise.resolve([
            { name: 'id' },
            { name: 'user_id' },
            { name: 'image_path' },
            { name: 'disease_class' },
            { name: 'confidence' },
            { name: 'is_uncertain' },
            { name: 'scanned_at' },
            { name: 'synced' },
          ]);
        }
        return Promise.resolve([]);
      }),
      withTransactionAsync: jest.fn(async (cb) => {
        await cb();
      }),
    };

    await jest.isolateModules(async () => {
      const sqliteModule = require('expo-sqlite');
      sqliteModule.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);
      const dbModule = require('../src/services/database');

      await dbModule.getDatabase();

      // Confirm all 3 columns were added via ALTER TABLE
      expect(alteredColumns.some((s) => s.includes('model_version'))).toBe(true);
      expect(alteredColumns.some((s) => s.includes('image_thumbnail_path'))).toBe(true);
      expect(alteredColumns.some((s) => s.includes('deleted_at'))).toBe(true);
    });
  });

  it('verifies saveScanToHistory populates model_version and soft delete/restore cycle', async () => {
    let savedRow = null;
    let softDeletedId = null;
    let restoredId = null;

    const mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockImplementation((sql, ...params) => {
        if (sql.includes('INSERT INTO scan_history')) {
          savedRow = { sql, params };
          return Promise.resolve({ lastInsertRowId: 101, changes: 1 });
        }
        if (sql.includes('UPDATE scan_history SET deleted_at = datetime')) {
          softDeletedId = params[0];
          return Promise.resolve({ changes: 1 });
        }
        if (sql.includes('UPDATE scan_history SET deleted_at = NULL')) {
          restoredId = params[0];
          return Promise.resolve({ changes: 1 });
        }
        return Promise.resolve({ changes: 1 });
      }),
      getFirstAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('sync_enabled')) {
          return Promise.resolve({ value: 'false' });
        }
        return Promise.resolve({ cnt: 1 });
      }),
      getAllAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('table_info(scan_history)')) {
          return Promise.resolve([
            { name: 'id' },
            { name: 'model_version' },
            { name: 'image_thumbnail_path' },
            { name: 'deleted_at' },
          ]);
        }
        if (query.includes('WHERE s.deleted_at IS NULL')) {
          // returns active rows
          return Promise.resolve([
            { id: 101, disease_class: 'Rice___Blast', model_version: 'legacy-unknown', deleted_at: null },
          ]);
        }
        return Promise.resolve([]);
      }),
      withTransactionAsync: jest.fn(async (cb) => {
        await cb();
      }),
    };

    await jest.isolateModules(async () => {
      const sqliteModule = require('expo-sqlite');
      sqliteModule.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);
      const dbModule = require('../src/services/database');

      // 1. Save scan
      await dbModule.saveScanToHistory('file:///docs/scans/test.jpg', 'Rice___Blast', 0.95);
      expect(savedRow).not.toBeNull();
      expect(savedRow.sql).toContain('model_version');
      expect(savedRow.params).toContain('plantcare-v1.0');

      // 2. Load active history
      const history = await dbModule.loadHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe(101);

      // 3. Soft delete
      await dbModule.deleteHistoryItem(101);
      expect(softDeletedId).toBe(101);

      // 4. Restore
      await dbModule.restoreHistoryItem(101);
      expect(restoredId).toBe(101);
    });
  });
});
