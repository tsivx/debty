import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Debt, Payment, Settings } from './types'

const DEBTS_KEY = 'debty:debts:v1'
const SETTINGS_KEY = 'debty:settings:v1'

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  defaultCurrency: 'RUB',
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Приватный режим или переполненное хранилище — молча пропускаем
  }
}

export interface NewDebt extends Omit<Debt, 'id' | 'createdAt' | 'payments'> {
  payments?: Payment[]
}

export interface StoreValue {
  debts: Debt[]
  settings: Settings
  addDebt: (draft: NewDebt) => Debt
  updateDebt: (id: string, patch: Partial<Debt>) => void
  removeDebt: (id: string) => void
  addPayment: (debtId: string, payment: Omit<Payment, 'id'>) => void
  removePayment: (debtId: string, paymentId: string) => void
  replaceAll: (debts: Debt[], settings?: Settings) => void
  clearAll: () => void
  patchSettings: (patch: Partial<Settings>) => void
}

const StoreContext = createContext<StoreValue | null>(null)

function applyTheme(theme: Settings['theme']) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', dark)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [debts, setDebts] = useState<Debt[]>(() => loadJSON(DEBTS_KEY, [] as Debt[]))
  const [settings, setSettings] = useState<Settings>(() =>
    loadJSON(SETTINGS_KEY, DEFAULT_SETTINGS),
  )

  useEffect(() => {
    saveJSON(DEBTS_KEY, debts)
  }, [debts])

  useEffect(() => {
    saveJSON(SETTINGS_KEY, settings)
    applyTheme(settings.theme)
  }, [settings])

  // Следим за сменой системной темы
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme(settings.theme)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [settings.theme])

  const addDebt = useCallback((draft: NewDebt) => {
    const debt: Debt = {
      ...draft,
      payments: draft.payments ?? [],
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      contact: draft.contact ?? {},
    }
    setDebts((prev) => [debt, ...prev])
    return debt
  }, [])

  const updateDebt = useCallback((id: string, patch: Partial<Debt>) => {
    setDebts((prev) => prev.map((debt) => (debt.id === id ? { ...debt, ...patch } : debt)))
  }, [])

  const removeDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((debt) => debt.id !== id))
  }, [])

  const addPayment = useCallback((debtId: string, payment: Omit<Payment, 'id'>) => {
    setDebts((prev) =>
      prev.map((debt) =>
        debt.id === debtId
          ? { ...debt, payments: [...debt.payments, { ...payment, id: crypto.randomUUID() }] }
          : debt,
      ),
    )
  }, [])

  const removePayment = useCallback((debtId: string, paymentId: string) => {
    setDebts((prev) =>
      prev.map((debt) =>
        debt.id === debtId
          ? { ...debt, payments: debt.payments.filter((p) => p.id !== paymentId) }
          : debt,
      ),
    )
  }, [])

  const replaceAll = useCallback((nextDebts: Debt[], nextSettings?: Settings) => {
    setDebts(nextDebts)
    if (nextSettings) setSettings(nextSettings)
  }, [])

  const clearAll = useCallback(() => setDebts([]), [])

  const patchSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      debts,
      settings,
      addDebt,
      updateDebt,
      removeDebt,
      addPayment,
      removePayment,
      replaceAll,
      clearAll,
      patchSettings,
    }),
    [
      debts,
      settings,
      addDebt,
      updateDebt,
      removeDebt,
      addPayment,
      removePayment,
      replaceAll,
      clearAll,
      patchSettings,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore должен использоваться внутри StoreProvider')
  return context
}
