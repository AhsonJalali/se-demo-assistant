import { fillTemplate, fillDeep, titleCase, loadSettings, DEFAULT_SETTINGS } from './workspace';

const settings = { productName: 'acme cloud', companyName: 'Acme Inc.' };

describe('fillTemplate', () => {
  it('replaces product and company tokens', () => {
    expect(fillTemplate('Try {{product}} from {{company}}', settings)).toBe('Try acme cloud from Acme Inc.');
  });

  it('capitalises when the token is capitalised', () => {
    expect(fillTemplate('{{Product}} scales.', settings)).toBe('Acme cloud scales.');
  });

  it('falls back to defaults for blank settings', () => {
    expect(fillTemplate('{{product}}', { productName: '  ' })).toBe(DEFAULT_SETTINGS.productName);
  });

  it('leaves non-strings and token-free text untouched', () => {
    expect(fillTemplate(42, settings)).toBe(42);
    expect(fillTemplate('plain', settings)).toBe('plain');
  });
});

describe('fillDeep', () => {
  it('fills strings nested in arrays and objects without mutating the input', () => {
    const input = { a: ['{{product}}'], b: { c: '{{Company}}', n: 1 } };
    const out = fillDeep(input, settings);
    expect(out).toEqual({ a: ['acme cloud'], b: { c: 'Acme Inc.', n: 1 } });
    expect(input.a[0]).toBe('{{product}}');
  });
});

describe('titleCase', () => {
  it('capitalises the first letter only', () => {
    expect(titleCase('our platform')).toBe('Our platform');
    expect(titleCase('')).toBe('');
  });
});

describe('loadSettings', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('merges stored values over defaults', () => {
    localStorage.setItem('sda-workspace-settings', JSON.stringify({ productName: 'Acme' }));
    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, productName: 'Acme' });
  });

  it('survives corrupted JSON', () => {
    localStorage.setItem('sda-workspace-settings', '{nope');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
