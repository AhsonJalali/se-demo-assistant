import { formatDate, formatDateTime, formatRelative } from './format';

describe('formatDate', () => {
  it('formats a date string as "Mon D, YYYY"', () => {
    expect(formatDate('2026-03-05T00:00:00Z')).toBe(
      new Date('2026-03-05T00:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    );
  });

  it('accepts custom Intl options', () => {
    const d = '2026-03-05T00:00:00Z';
    expect(formatDate(d, { year: 'numeric' })).toBe(new Date(d).toLocaleDateString(undefined, { year: 'numeric' }));
  });

  it('returns an em dash for nullish or invalid input', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate('not a date')).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats a date string with date and time', () => {
    const value = '2026-03-05T14:30:00Z';
    expect(formatDateTime(value)).toBe(
      new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    );
  });

  it('returns an em dash for nullish or invalid input', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDateTime('garbage')).toBe('—');
  });
});

describe('formatRelative', () => {
  const now = new Date('2026-03-05T12:00:00Z').getTime();

  it('returns "just now" for under a minute', () => {
    expect(formatRelative(new Date(now - 30_000).toISOString(), now)).toBe('just now');
  });

  it('formats minutes ago under an hour', () => {
    expect(formatRelative(new Date(now - 5 * 60_000).toISOString(), now)).toBe('5m ago');
  });

  it('formats hours ago under a day', () => {
    expect(formatRelative(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe('3h ago');
  });

  it('formats days ago under a week', () => {
    expect(formatRelative(new Date(now - 2 * 86_400_000).toISOString(), now)).toBe('2d ago');
  });

  it('falls back to formatDate at a week or more', () => {
    const value = new Date(now - 8 * 86_400_000).toISOString();
    expect(formatRelative(value, now)).toBe(formatDate(value));
  });

  it('returns an em dash for nullish or invalid input', () => {
    expect(formatRelative(null, now)).toBe('—');
    expect(formatRelative(undefined, now)).toBe('—');
    expect(formatRelative('not a date', now)).toBe('—');
  });

  it('defaults "now" to the current time when not provided', () => {
    expect(formatRelative(new Date().toISOString())).toBe('just now');
  });
});
