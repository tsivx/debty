/** Направление долга: я должен / мне должны */
export type Direction = 'owe' | 'owed'

/** Тип контрагента */
export type DebtKind = 'person' | 'bank' | 'other'

/** Валюты, которые понимает приложение */
export type CurrencyCode =
  | 'RUB'
  | 'USD'
  | 'EUR'
  | 'KZT'
  | 'CNY'
  | 'GBP'
  | 'BYN'
  | 'UAH'
  | 'TRY'
  | 'AMD'

/** Отдельный платёж по долгу */
export interface Payment {
  id: string
  /** Сумма платежа (положительная) */
  amount: number
  /** Дата в формате YYYY-MM-DD */
  date: string
  note?: string
}

/** Контактные данные контрагента */
export interface ContactInfo {
  phone?: string
  email?: string
  telegram?: string
  note?: string
}

/** Долг */
export interface Debt {
  id: string
  direction: Direction
  /** Название записи, например «Кредитка Т-Банк» */
  title: string
  kind: DebtKind
  /** Человек или банк */
  counterparty: string
  /** Полная сумма долга */
  amount: number
  currency: CurrencyCode
  /** Зачем занимали */
  description?: string
  /** Крайний срок в формате YYYY-MM-DD */
  dueDate?: string
  contact: ContactInfo
  createdAt: string
  payments: Payment[]
}

/** Статус долга (вычисляется) */
export type DebtStatus = 'closed' | 'overdue' | 'soon' | 'active'

/** Вычисленные показатели долга */
export interface DebtStats {
  paid: number
  remaining: number
  /** 0..1 */
  progress: number
  status: DebtStatus
  /** Дней до срока (отрицательно = просрочен), null если срока нет */
  daysLeft: number | null
}

/** Настройки приложения */
export interface Settings {
  theme: 'light' | 'dark' | 'system'
  defaultCurrency: CurrencyCode
}

/** Экспортируемый файл данных */
export interface BackupFile {
  app: 'debty'
  version: 1
  exportedAt: string
  debts: Debt[]
  settings: Settings
}
