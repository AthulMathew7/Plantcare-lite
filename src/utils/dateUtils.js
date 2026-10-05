/**
 * Format an ISO-ish datetime string to a relative label.
 * Accepts SQLite datetime format ("2024-03-15 09:40:00") or ISO strings.
 */
function parseScanDate(dateString) {
  if (dateString.includes('T')) {
    const hasZone = /Z|[+-]\d{2}:?\d{2}$/.test(dateString);
    return new Date(hasZone ? dateString : `${dateString}Z`);
  }
  return new Date(`${dateString.replace(' ', 'T')}Z`);
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatRelativeDate(dateString, now = new Date()) {
  if (!dateString) return '';
  const date = parseScanDate(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const dayDiff = Math.round(
    (startOfLocalDay(now) - startOfLocalDay(date)) / 86400000,
  );

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (dayDiff === 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;
  return date.toLocaleDateString();
}
