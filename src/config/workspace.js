/**
 * Workspace settings — what makes the assistant product-agnostic.
 *
 * Content in src/data/*.json refers to the product being sold as {{product}}
 * and the selling company as {{company}}; fillTemplate() swaps in the values
 * configured in Settings. The same values feed the AI prompts.
 */

const STORAGE_KEY = 'sda-workspace-settings';

export const ACCENTS = [
  { id: 'indigo', name: 'Indigo', swatch: '#4F46E5' },
  { id: 'blue', name: 'Blue', swatch: '#2563EB' },
  { id: 'teal', name: 'Teal', swatch: '#0D9488' },
  { id: 'violet', name: 'Violet', swatch: '#7C3AED' },
  { id: 'rose', name: 'Rose', swatch: '#E11D48' },
  { id: 'graphite', name: 'Graphite', swatch: '#1F2937' },
];

export const THEMES = ['system', 'light', 'dark'];

export const DEFAULT_SETTINGS = {
  productName: 'our platform',
  companyName: 'our team',
  productPitch: '',
  theme: 'system',
  accent: 'indigo',
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage blocked or full — settings still apply for this visit.
  }
}

/** Resolve 'system' to the OS preference. */
export function resolveTheme(theme) {
  if (theme === 'light' || theme === 'dark') return theme;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyAppearance({ theme, accent }) {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(theme);
  root.dataset.accent = ACCENTS.some(a => a.id === accent) ? accent : 'indigo';
}

/** Display form of the product name, e.g. for headings ("Why Our platform"). */
export function titleCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Replace {{product}} / {{Product}} / {{company}} / {{Company}} tokens.
 * Capitalised tokens capitalise the first letter of the value, so sentence
 * starts read naturally even when the product name is lowercase.
 */
export function fillTemplate(text, settings) {
  if (typeof text !== 'string' || !text.includes('{{')) return text;
  const product = settings?.productName?.trim() || DEFAULT_SETTINGS.productName;
  const company = settings?.companyName?.trim() || DEFAULT_SETTINGS.companyName;
  return text
    .replace(/\{\{product\}\}/g, product)
    .replace(/\{\{Product\}\}/g, titleCase(product))
    .replace(/\{\{company\}\}/g, company)
    .replace(/\{\{Company\}\}/g, titleCase(company));
}

/** Deep-apply fillTemplate to every string in a JSON-ish value. */
export function fillDeep(value, settings) {
  if (typeof value === 'string') return fillTemplate(value, settings);
  if (Array.isArray(value)) return value.map(v => fillDeep(v, settings));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = fillDeep(v, settings);
    return out;
  }
  return value;
}
