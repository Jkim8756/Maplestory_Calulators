import { useState, useCallback } from 'react'
import { parseStoredValue, stringifyStoredValue } from '../lib/storage'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      return parseStoredValue(localStorage.getItem(key), initialValue)
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
        if (typeof window === 'undefined') return next
        try {
          localStorage.setItem(key, stringifyStoredValue(next))
        } catch { /* storage full or SSR */ }
        return next
      })
    },
    [key]
  )

  return [storedValue, setValue]
}
