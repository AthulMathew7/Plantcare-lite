jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  makeDirectoryAsync: jest.fn(async () => {}),
  copyAsync: jest.fn(async () => {}),
  deleteAsync: jest.fn(async () => {}),
}));

import * as FileSystem from 'expo-file-system/legacy';
import {
  persistScanImage,
  isPersistedScanImage,
} from '../src/services/imageStorage';

describe('imageStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('copies a picker URI into documentDirectory/scans', async () => {
    const dest = await persistScanImage('file:///cache/leaf.jpg');
    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
    expect(FileSystem.copyAsync).toHaveBeenCalledWith({
      from: 'file:///cache/leaf.jpg',
      to: dest,
    });
    expect(dest.startsWith('file:///docs/scans/')).toBe(true);
    expect(dest.endsWith('.jpg')).toBe(true);
  });

  it('does not copy an already-persisted scan URI', async () => {
    const existing = 'file:///docs/scans/already.jpg';
    const dest = await persistScanImage(existing);
    expect(dest).toBe(existing);
    expect(FileSystem.copyAsync).not.toHaveBeenCalled();
  });

  it('identifies persisted scan paths', () => {
    expect(isPersistedScanImage('file:///docs/scans/a.jpg')).toBe(true);
    expect(isPersistedScanImage('file:///cache/tmp.jpg')).toBe(false);
  });
});
