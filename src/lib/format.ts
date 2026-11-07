import type { CurrencyCode } from './types'

export const CURRENCIES: { code: CurrencyCode; label: string; flag: string }[] = [
  { code: 'RUB', label: 'Рубль', flag: '₽' },
  { code: 'USD', label: 'Доллар', flag: '$' },
  { code: 'EUR', label: 'Евро', flag: '€' },
  { code: 'KZT', label: 'Тенге', flag: '₸' },
  { code: 'CNY', label: 'Юань', flag: '¥' },
  { code: 'GBP', label: 'Фунт', flag: '£' },
  { code: 'BYN', label: 'Бел. рубль', flag: 'Br' },
  { code: 'UAH', label: 'Гривна', flag: '₴' },
  { code: 'TRY', label: 'Лира', flag: '₺' },
  { code: 'AMD', label: 'Драм', flag: '֏' },
]

const moneyFormatters = new Map<string, Intl.NumberFormat>()

function getMoneyFormatter(currency: CurrencyCode) {
  let formatter = moneyFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    })
    moneyFormatters.set(currency, formatter)
  }
  return formatter
}

/** 12345.5 → «12 345,50 ₽» */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  return getMoneyFormatter(currency).format(amount)
}

/** Короткая форма для метрик: 1250000 → «1,25 млн ₽» */
export function formatMoneyCompact(amount: number, currency: CurrencyCode): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) {
    const value = amount / 1_000_000
    return `${round(value, 2)} млн ${symbolOf(currency)}`
  }
  if (abs >= 10_000) {
    return `${round(amount / 1_000, 1)} тыс. ${symbolOf(currency)}`
  }
  return formatMoney(amount, currency)
}

export function symbolOf(currency: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === currency)?.flag ?? currency
}

export function round(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/** Сегодняшняя дата в локальной таймзоне, YYYY-MM-DD */
export function todayISO(): string {
  const now = new Date()
  return toISODate(now)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Сколько дней осталось до даты (сегодня = 0) */
export function daysUntil(iso: string): number {
  const target = parseISODate(iso)
  const today = parseISODate(todayISO())
  const ms = target.getTime() - today.getTime()
  return Math.round(ms / 86_400_000)
}

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const DATE_FORMAT_SHORT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
})

/** YYYY-MM-DD → «12 мая 2026 г.» */
export function formatDate(iso: string): string {
  return DATE_FORMAT.format(parseISODate(iso))
}

/** YYYY-MM-DD → «12 мая» */
export function formatDateShort(iso: string): string {
  return DATE_FORMAT_SHORT.format(parseISODate(iso))
}

const RELATIVE = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'always' })

/** «через 5 дней» / «3 дня назад» */
export function formatRelativeDays(days: number): string {
  if (days === 0) return 'сегодня'
  if (days === 1) return 'завтра'
  if (days === -1) return 'вчера'
  if (days > 0) return RELATIVE.format(days, 'day')
  return RELATIVE.format(days, 'day')
}

/** Склонение: plural(5, ['день','дня','дней']) */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100
  const n1 = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (n1 > 1 && n1 < 5) return forms[1]
  if (n1 === 1) return forms[0]
  return forms[2]
}

export function daysWord(n: number): string {
  return `${Math.abs(n)} ${plural(n, ['день', 'дня', 'дней'])}`
}
