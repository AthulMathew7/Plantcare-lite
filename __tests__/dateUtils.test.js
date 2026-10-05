import { formatRelativeDate } from '../src/utils/dateUtils';

describe('formatRelativeDate', () => {
  function sqliteDateFrom(date) {
    return date.toISOString().replace('T', ' ').slice(0, 19);
  }

  it('returns empty string for falsy input', () => {
    expect(formatRelativeDate('')).toBe('');
    expect(formatRelativeDate(null)).toBe('');
    expect(formatRelativeDate(undefined)).toBe('');
  });

  it('returns "Just now" for <1 minute ago', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    expect(formatRelativeDate(sqliteDateFrom(now), now)).toBe('Just now');
  });

  it('returns "X min ago" for 1-59 minutes', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    const then = new Date(now.getTime() - 15 * 60000);
    expect(formatRelativeDate(sqliteDateFrom(then), now)).toMatch(/^\d+ min ago$/);
  });

  it('returns "Today, H:MM" for earlier today', () => {
    const now = new Date('2026-06-15T18:00:00Z');
    const then = new Date(now.getTime() - 120 * 60000);
    expect(formatRelativeDate(sqliteDateFrom(then), now)).toMatch(/^Today, \d+:\d{2}/);
  });

  it('returns "Yesterday" for the previous local calendar day', () => {
    const now = new Date('2026-03-01T12:00:00Z');
    const then = new Date('2026-02-28T12:00:00Z');
    expect(formatRelativeDate(sqliteDateFrom(then), now)).toBe('Yesterday');
  });

  it('returns "X days ago" for 2-6 days', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    const then = new Date(now.getTime() - 4 * 24 * 60 * 60000);
    expect(formatRelativeDate(sqliteDateFrom(then), now)).toBe('4 days ago');
  });

  it('returns a locale date string for 7+ days', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    const then = new Date(now.getTime() - 14 * 24 * 60 * 60000);
    const result = formatRelativeDate(sqliteDateFrom(then), now);
    expect(result).not.toMatch(/ago/);
    expect(result.length).toBeGreaterThan(0);
  });
});
