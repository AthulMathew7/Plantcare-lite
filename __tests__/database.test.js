import { getDatabase, saveScanToHistory, loadHistory } from '../src/services/database';
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

describe('database service unit tests', () => {
  let SQLite;
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();
    SQLite = require('expo-sqlite');
  });

  it('initializes tables, sets PRAGMA foreign_keys, and seeds database atomically', async () => {
    // Mock the default user check for an unseeded database
    let userChecked = false;

    const mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
      getFirstAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('users WHERE id = 1')) {
          userChecked = true;
          return Promise.resolve({ cnt: 0 });
        }
        return Promise.resolve(null);
      }),
      getAllAsync: jest.fn().mockResolvedValue([]),
      withTransactionAsync: jest.fn(async (cb) => {
        await cb();
      }),
    };

    SQLite.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);

    // Call getDatabase
    const dbInstance = await getDatabase();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('plantcare.db');
    expect(mockDatabase.execAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON;');
    expect(mockDatabase.withTransactionAsync).toHaveBeenCalled();
    expect(userChecked).toBe(true);

    // Verify user seeding insert call
    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      "INSERT INTO users (id, display_name) VALUES (1, 'Farmer')",
    );

    // Verify disease info seeding called for all seed rows
    for (const info of diseaseInfo) {
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO disease_info'),
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
    const diseaseSeedCalls = mockDatabase.runAsync.mock.calls.filter(([query]) =>
      query.includes('INSERT INTO disease_info'),
    );
    expect(diseaseSeedCalls).toHaveLength(22);
    expect(diseaseSeedCalls.map(([, values]) => values[0])).toEqual(
      diseaseInfo.map((info) => info.class_name),
    );
  });

  it('synchronizes updated catalog metadata when the database is already fully seeded', async () => {
    const mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
      getFirstAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('users WHERE id = 1')) {
          return Promise.resolve({ cnt: 1 });
        }
        if (query.includes('disease_info')) {
          return Promise.resolve({ cnt: diseaseInfo.length });
        }
        return Promise.resolve(null);
      }),
      getAllAsync: jest.fn().mockResolvedValue([]),
      withTransactionAsync: jest.fn(async (cb) => {
        await cb();
      }),
    };

    // Force module reset to test fresh getDatabase initialization
    await jest.isolateModulesAsync(async () => {
      const dbModule = require('../src/services/database');
      const sqliteModule = require('expo-sqlite');
      sqliteModule.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);

      await dbModule.getDatabase();

      const diseaseSeedCalls = mockDatabase.runAsync.mock.calls.filter(([query]) =>
        query.includes('INSERT INTO disease_info'),
      );
      expect(diseaseSeedCalls).toHaveLength(22);
      expect(diseaseSeedCalls.every(([query]) => query.includes('ON CONFLICT(class_name) DO UPDATE'))).toBe(true);
    });
  });

  it('rolls back seeding transaction on error, preventing partial seeding', async () => {
    const mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('INSERT INTO users')) {
          throw new Error('Disk full during seed');
        }
        return Promise.resolve({ lastInsertRowId: 1, changes: 1 });
      }),
      getFirstAsync: jest.fn().mockResolvedValue({ cnt: 0 }),
      getAllAsync: jest.fn().mockResolvedValue([]),
      withTransactionAsync: jest.fn(async (cb) => {
        try {
          await cb();
        } catch (e) {
          // Transaction rolls back on error
          throw e;
        }
      }),
    };

    await jest.isolateModulesAsync(async () => {
      const dbModule = require('../src/services/database');
      const sqliteModule = require('expo-sqlite');
      sqliteModule.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);

      await expect(dbModule.getDatabase()).rejects.toThrow('Database initialization failed');
    });
  });

  it('performs soft delete and restore', async () => {
    const mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
      getFirstAsync: jest.fn().mockImplementation((query) => (
        query.includes('auth_provider_id')
          ? Promise.resolve({ id: 42, display_name: 'Test User', email: 'test@example.com' })
          : Promise.resolve({ cnt: 1 })
      )),
      getAllAsync: jest.fn().mockResolvedValue([]),
      withTransactionAsync: jest.fn(async (cb) => {
        await cb();
      }),
    };

    await jest.isolateModulesAsync(async () => {
      const dbModule = require('../src/services/database');
      const sqliteModule = require('expo-sqlite');
      sqliteModule.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);

      await dbModule.linkLocalUserToAuthAccount({
        uid: 'firebase-user-42',
        email: 'test@example.com',
        displayName: 'Test User',
      });
      await dbModule.deleteHistoryItem(42);
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "UPDATE scan_history SET deleted_at = datetime('now') WHERE id = ? AND user_id = ?",
        42, 42,
      );

      await dbModule.restoreHistoryItem(42);
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        'UPDATE scan_history SET deleted_at = NULL WHERE id = ? AND user_id = ?',
        42, 42,
      );
    });
  });
});
