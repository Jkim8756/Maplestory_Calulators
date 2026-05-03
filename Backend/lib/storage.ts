export const STORAGE_KEYS = {
  BOSS:        'ms_calc_boss_state',
  EXP:         'ms_calc_exp_state',
  SYMBOLS:     'ms_calc_symbol_state',
  LIBERATION:  'ms_calc_liberation_state',
  ACTIVE_TAB:  'ms_calc_active_tab',
  GAME_DATA:   'ms_calc_game_data_override',
} as const

const SET_MARKER = '__type'
const SET_VALUE = 'Set'

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function storageReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Set) {
    return { [SET_MARKER]: SET_VALUE, values: Array.from(value) }
  }
  return value
}

export function storageReviver(_key: string, value: unknown): unknown {
  if (
    value &&
    typeof value === 'object' &&
    (value as Record<string, unknown>)[SET_MARKER] === SET_VALUE &&
    Array.isArray((value as Record<string, unknown>).values)
  ) {
    return new Set((value as { values: unknown[] }).values)
  }
  return value
}

export function parseStoredValue<T>(item: string | null, defaultValue: T): T {
  if (!item) return defaultValue
  try {
    return JSON.parse(item, storageReviver) as T
  } catch {
    return defaultValue
  }
}

export function stringifyStoredValue(value: unknown): string {
  return JSON.stringify(value, storageReplacer)
}

export function loadState<T>(key: string, defaultValue: T): T {
  if (!hasLocalStorage()) return defaultValue
  try {
    return parseStoredValue(localStorage.getItem(key), defaultValue)
  } catch {
    return defaultValue
  }
}

export function saveState<T>(key: string, value: T): void {
  if (!hasLocalStorage()) return
  try {
    localStorage.setItem(key, stringifyStoredValue(value))
  } catch { /* ignore */ }
}

export function removeState(key: string): void {
  if (!hasLocalStorage()) return
  try {
    localStorage.removeItem(key)
  } catch { /* ignore */ }
}

export function createLocalStorageRepository<T>(key: string, defaultValue: T) {
  return {
    load: () => loadState(key, defaultValue),
    save: (value: T) => saveState(key, value),
    clear: () => removeState(key),
  }
}
