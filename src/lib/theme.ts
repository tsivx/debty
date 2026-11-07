import type { Settings } from './types'

export function resolveDark(theme: Settings['theme']): boolean {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
