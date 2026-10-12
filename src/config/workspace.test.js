import { fillTemplate, fillDeep, titleCase, loadSettings, saveSettings, resolveTheme, applyAppearance, ACCENTS, DEFAULT_SETTINGS } from './workspace';

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

describe('saveSettings', () => {
  beforeEach(() => localStorage.clear());

  it('persists settings so loadSettings reads them back', () => {
    saveSettings({ ...DEFAULT_SETTINGS, productName: 'Acme' });
    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, productName: 'Acme' });
  });

  it('does not throw when localStorage.setItem fails', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveSettings(DEFAULT_SETTINGS)).not.toThrow();
    spy.mockRestore();
  });
});

describe('resolveTheme', () => {
  it('returns light/dark unchanged', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });

  it('resolves "system" from the OS preference via matchMedia', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true });
    expect(resolveTheme('system')).toBe('dark');
    spy.mockReturnValue({ matches: false });
    expect(resolveTheme('system')).toBe('light');
    spy.mockRestore();
  });

  it('falls back to light when matchMedia is unavailable', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation(() => {
      throw new Error('not implemented');
    });
    expect(resolveTheme('system')).toBe('light');
    spy.mockRestore();
  });
});

describe('applyAppearance', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.accent;
  });

  it('sets the resolved theme and accent on the document root', () => {
    applyAppearance({ theme: 'dark', accent: 'teal' });
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.dataset.accent).toBe('teal');
  });

  it('falls back to indigo for an unknown accent', () => {
    applyAppearance({ theme: 'light', accent: 'not-a-real-accent' });
    expect(document.documentElement.dataset.accent).toBe('indigo');
  });

  it('resolves "system" through matchMedia before setting the theme', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true });
    applyAppearance({ theme: 'system', accent: ACCENTS[0].id });
    expect(document.documentElement.dataset.theme).toBe('dark');
    spy.mockRestore();
  });
});
