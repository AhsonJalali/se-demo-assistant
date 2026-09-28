// Node 22+ ships its own global localStorage (experimental Web Storage), which
// shadows jsdom's and lacks a working clear(). Point tests at jsdom's storage.
if (typeof globalThis.localStorage?.clear !== 'function' && globalThis.jsdom) {
  for (const key of ['localStorage', 'sessionStorage']) {
    Object.defineProperty(globalThis, key, {
      value: globalThis.jsdom.window[key],
      configurable: true,
      writable: true,
    });
  }
}
