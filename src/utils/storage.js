const PREFIX = "cleanest.";

export function getSetting(key, defaultValue = 0) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export function saveSetting(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function loadSettingsObject(key, defaultObj = {}) {
  return getSetting(key, defaultObj);
}

export function saveSettingsObject(key, obj) {
  saveSetting(key, obj);
}
