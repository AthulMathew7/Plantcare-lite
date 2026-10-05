import * as FileSystem from 'expo-file-system/legacy';

function scansDirectory() {
  const root = FileSystem.documentDirectory;
  if (!root) return null;
  return `${root}scans/`;
}

function extensionFromUri(uri) {
  const cleaned = (uri || '').split('?')[0];
  const match = cleaned.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : 'jpg';
}

export function isPersistedScanImage(uri) {
  const dir = scansDirectory();
  return Boolean(uri && dir && String(uri).startsWith(dir));
}

/**
 * Copy a camera/gallery URI into app documents so history thumbnails survive
 * cache eviction. Already-persisted URIs are returned as-is.
 */
export async function persistScanImage(sourceUri) {
  if (!sourceUri) {
    throw new Error('No image to save');
  }

  if (isPersistedScanImage(sourceUri)) {
    return sourceUri;
  }

  const dir = scansDirectory();
  if (!dir) {
    return sourceUri;
  }

  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const dest = `${dir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFromUri(sourceUri)}`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function deleteScanImage(uri) {
  const dir = scansDirectory();
  if (!uri || !dir || !uri.startsWith(dir)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // File may already be gone
  }
}

export async function deleteAllScanImages() {
  const dir = scansDirectory();
  if (!dir) return;
  try {
    await FileSystem.deleteAsync(dir, { idempotent: true });
  } catch {
    // Directory may not exist yet
  }
}

/**
 * Generate a 150x150 thumbnail for a scan image and persist it into documents.
 */
export async function generateThumbnail(sourceUri) {
  if (!sourceUri) return null;
  try {
    const manip = await import('expo-image-manipulator');
    const manipResult = await manip.manipulateAsync(
      sourceUri,
      [{ resize: { width: 150, height: 150 } }],
      { compress: 0.7, format: manip.SaveFormat?.JPEG || 'jpeg' }
    );
    if (manipResult?.uri) {
      return await persistScanImage(manipResult.uri);
    }
    return null;
  } catch (err) {
    // Graceful fallback if image manipulation is unavailable
    return null;
  }
}

