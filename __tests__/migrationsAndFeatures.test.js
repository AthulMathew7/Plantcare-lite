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
        if (query.includes('table_info(users)')) {
          return Promise.resolve([
            { name: 'id' },
            { name: 'display_name' },
            { name: 'email' },
            { name: 'auth_provider_id' },
            { name: 'created_at' },
            { name: 'updated_at' },
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
        if (sql.includes('ALTER TABLE')) {
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
      expect(alteredColumns.some((s) => s.includes('email'))).toBe(true);
      expect(alteredColumns.some((s) => s.includes('auth_provider_id'))).toBe(true);
      expect(alteredColumns.some((s) => s.includes('updated_at'))).toBe(true);
    });
  });

  it('reports legacy scans for explicit import instead of silently assigning them', async () => {
    const mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
      getFirstAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('users WHERE id = 1')) return Promise.resolve({ id: 1 });
        if (query.includes('auth_provider_id')) return Promise.resolve(null);
        if (query.includes('COUNT(*) AS count')) return Promise.resolve({ count: 3 });
        return Promise.resolve({ cnt: 1 });
      }),
      getAllAsync: jest.fn().mockResolvedValue([]),
      withTransactionAsync: jest.fn(async (callback) => callback()),
    };

    await jest.isolateModules(async () => {
      const sqliteModule = require('expo-sqlite');
      sqliteModule.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);
      const dbModule = require('../src/services/database');
      const status = await dbModule.getLocalAccountStatus({
        uid: 'new-firebase-user',
        email: 'new@example.com',
      });

      expect(status).toEqual({ linked: false, legacyScanCount: 3 });
      expect(
        mockDatabase.runAsync.mock.calls.some(([query]) => query.includes('auth_provider_id')),
      ).toBe(false);
    });
  });

  it('links approved Farmer history to Firebase without deleting scan or image records', async () => {
    const runCalls = [];
    const mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockImplementation((query, ...params) => {
        runCalls.push({ query, params });
        return Promise.resolve({ lastInsertRowId: 2, changes: 1 });
      }),
      getFirstAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('users WHERE id = 1')) {
          return Promise.resolve({ id: 1, display_name: 'Farmer' });
        }
        if (query.includes('auth_provider_id')) return Promise.resolve(null);
        if (query.includes('COUNT(*) AS count')) return Promise.resolve({ count: 2 });
        return Promise.resolve({ cnt: 22 });
      }),
      getAllAsync: jest.fn().mockResolvedValue([]),
      withTransactionAsync: jest.fn(async (callback) => callback()),
    };

    await jest.isolateModules(async () => {
      const sqliteModule = require('expo-sqlite');
      sqliteModule.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);
      const dbModule = require('../src/services/database');
      const authUser = { uid: 'firebase-import-1', email: 'farmer@example.com' };

      const status = await dbModule.getLocalAccountStatus(authUser);
      expect(status.legacyScanCount).toBe(2);
      const localUser = await dbModule.linkLocalUserToAuthAccount(authUser, true);

      expect(localUser).toEqual({
        id: 1,
        display_name: 'Farmer',
        email: 'farmer@example.com',
      });

      expect(runCalls).toContainEqual({
        query: expect.stringContaining('auth_provider_id'),
        params: ['Farmer', 'farmer@example.com', 'firebase-import-1', 1],
      });
      expect(runCalls.some(({ query }) => query.includes('DELETE FROM scan_history'))).toBe(false);
      expect(runCalls.some(({ query }) => query.includes('UPDATE scan_history'))).toBe(false);
      expect(mockDatabase.execAsync.mock.calls.some(([query]) => query.includes('DROP TABLE'))).toBe(false);
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
        if (query.includes('auth_provider_id')) {
          return Promise.resolve({
            id: 77,
            display_name: 'Account Owner',
            email: 'owner@example.com',
          });
        }
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

      await dbModule.linkLocalUserToAuthAccount({
        uid: 'firebase-owner-77',
        email: 'owner@example.com',
        displayName: 'Account Owner',
      });

      // 1. Save scan
      const savedScan = await dbModule.saveScanToHistory(
        'file:///docs/scans/test.jpg',
        'Rice___Blast',
        0.95,
      );
      expect(savedScan).toMatchObject({ id: 101, userId: 77 });
      expect(savedRow).not.toBeNull();
      expect(savedRow.sql).toContain('model_version');
      expect(savedRow.params).toContain('plantcare-v1.0');
      expect(savedRow.sql).toContain('user_id');
      expect(savedRow.params[0]).toBe(77);

      // 2. Load active history
      const history = await dbModule.loadHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe(101);
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('s.user_id = ?'),
        77,
      );

      // 3. Soft delete
      await dbModule.deleteHistoryItem(101);
      expect(softDeletedId).toBe(101);
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('AND user_id = ?'),
        101,
        77,
      );

      // 4. Restore
      await dbModule.restoreHistoryItem(101);
      expect(restoredId).toBe(101);
    });
  });

  it('reuses and persists the unlinked Farmer profile for guest scans', async () => {
    let savedScan = null;
    const mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockImplementation((query, ...params) => {
        if (query.includes('INSERT INTO scan_history')) {
          savedScan = {
            id: 41,
            user_id: params[0],
            image_path: params[1],
            image_thumbnail_path: params[2],
            disease_class: params[3],
            confidence: params[4],
            is_uncertain: params[5],
            model_version: params[6],
            scanned_at: '2026-10-05 09:00:00',
          };
          return Promise.resolve({ lastInsertRowId: 41, changes: 1 });
        }
        return Promise.resolve({ lastInsertRowId: 2, changes: 1 });
      }),
      getFirstAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('guest_user_id')) return Promise.resolve(null);
        if (query.includes('users WHERE id = 1 AND auth_provider_id IS NULL')) {
          return Promise.resolve({ id: 1 });
        }
        if (query.includes('users WHERE id = 1')) return Promise.resolve({ cnt: 1 });
        if (query.includes('disease_info')) return Promise.resolve({ cnt: diseaseInfo.length });
        return Promise.resolve(null);
      }),
      getAllAsync: jest.fn().mockImplementation((query) => {
        if (query.includes('table_info(scan_history)')) {
          return Promise.resolve([
            { name: 'model_version' },
            { name: 'image_thumbnail_path' },
            { name: 'deleted_at' },
          ]);
        }
        if (query.includes('table_info(users)')) {
          return Promise.resolve([
            { name: 'email' },
            { name: 'auth_provider_id' },
            { name: 'updated_at' },
          ]);
        }
        if (query.includes('FROM scan_history s')) {
          return Promise.resolve(savedScan ? [savedScan] : []);
        }
        return Promise.resolve([]);
      }),
      withTransactionAsync: jest.fn(async (callback) => callback()),
    };

    await jest.isolateModulesAsync(async () => {
      const sqliteModule = require('expo-sqlite');
      sqliteModule.openDatabaseAsync.mockResolvedValueOnce(mockDatabase);
      const dbModule = require('../src/services/database');

      await expect(dbModule.activateGuestLocalUser()).resolves.toBe(1);
      await expect(dbModule.activateGuestLocalUser()).resolves.toBe(1);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO app_settings'),
        '1',
      );
      expect(
        mockDatabase.runAsync.mock.calls.some(([query]) => query.includes('INSERT INTO users')),
      ).toBe(false);

      const scan = await dbModule.saveScanToHistory(
        'file:///docs/scans/guest-test.jpg',
        'Rice___Blast',
        0.95,
      );
      expect(scan).toMatchObject({
        id: 41,
        userId: 1,
        imageUri: 'file:///docs/scans/guest-test.jpg',
        diseaseClass: 'Rice___Blast',
        confidence: 0.95,
        modelVersion: 'plantcare-v1.0',
      });
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO scan_history (user_id'),
        1,
        'file:///docs/scans/guest-test.jpg',
        null,
        'Rice___Blast',
        0.95,
        0,
        'plantcare-v1.0',
      );
      await expect(dbModule.loadHistory()).resolves.toEqual([savedScan]);
    });
  });
});
