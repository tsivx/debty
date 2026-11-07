import type { CurrencyCode, DebtKind, Direction } from './types'

export const DIRECTION_LABELS: Record<Direction, string> = {
  owe: 'Я должен',
  owed: 'Мне должны',
}

export const KIND_LABELS: Record<DebtKind, string> = {
  person: 'Человек',
  bank: 'Банк',
  other: 'Другое',
}

export type FilterKey = 'all' | 'owe' | 'owed' | 'overdue' | 'closed'

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'owe', label: 'Я должен' },
  { key: 'owed', label: 'Мне должны' },
  { key: 'overdue', label: 'Просрочены' },
  { key: 'closed', label: 'Погашены' },
]

export type SortKey = 'due' | 'amount' | 'progress' | 'title'

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'due', label: 'По сроку' },
  { key: 'amount', label: 'По сумме' },
  { key: 'progress', label: 'По прогрессу' },
  { key: 'title', label: 'По названию' },
]

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  RUB: 'Рубли',
  USD: 'Доллары',
  EUR: 'Евро',
  KZT: 'Тенге',
  CNY: 'Юани',
  GBP: 'Фунты',
  BYN: 'Бел. рубли',
  UAH: 'Гривны',
  TRY: 'Лиры',
  AMD: 'Драмы',
}

export function paymentLabel(direction: Direction): string {
  return direction === 'owe' ? 'Внести платёж' : 'Получить возврат'
}

export function paymentTitle(direction: Direction): string {
  return direction === 'owe' ? 'Внести платёж' : 'Получить возврат'
}
