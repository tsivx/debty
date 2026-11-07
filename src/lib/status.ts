import { daysUntil, round } from './format'
import type { Debt, DebtStats, CurrencyCode, DebtStatus } from './types'

/** За сколько дней до срока подсвечиваем «горит срок» */
export const SOON_DAYS = 7

/** Вычисляемые показатели долга */
export function getStats(debt: Debt): DebtStats {
  const paid = round(debt.payments.reduce((sum, p) => sum + p.amount, 0))
  const remaining = Math.max(0, round(debt.amount - paid))
  const progress = debt.amount > 0 ? Math.min(1, paid / debt.amount) : 0
  const daysLeft = debt.dueDate ? daysUntil(debt.dueDate) : null

  let status: DebtStatus = 'active'
  if (remaining <= 0.005) {
    status = 'closed'
  } else if (daysLeft !== null && daysLeft < 0) {
    status = 'overdue'
  } else if (daysLeft !== null && daysLeft <= SOON_DAYS) {
    status = 'soon'
  }

  return { paid, remaining, progress, status, daysLeft }
}

export interface StatusMeta {
  label: string
  className: string
}

/** Подпись и цвет статуса с учётом направления */
export function statusMeta(debt: Debt, stats: DebtStats): StatusMeta {
  const { status, daysLeft } = stats
  const iOwe = debt.direction === 'owe'

  if (status === 'closed') {
    return {
      label: iOwe ? 'Погашен' : 'Возвращён',
      className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    }
  }
  if (status === 'overdue') {
    const late = daysLeft !== null ? Math.abs(daysLeft) : 0
    return {
      label: iOwe ? `Просрочен на ${late}` : `Не вернули ${late}`,
      className: 'bg-destructive/15 text-destructive',
    }
  }
  if (status === 'soon') {
    return {
      label: daysLeft === 0 ? 'Срок сегодня' : `Осталось ${daysLeft}`,
      className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    }
  }
  return {
    label: 'Активен',
    className: 'bg-muted text-muted-foreground',
  }
}

/** Цвет прогресс-бара по статусу */
export function progressClass(status: DebtStatus): string {
  switch (status) {
    case 'closed':
      return 'bg-emerald-500'
    case 'overdue':
      return 'bg-destructive'
    case 'soon':
      return 'bg-amber-500'
    default:
      return 'bg-primary'
  }
}

export interface CurrencyTotals {
  total: number
  paid: number
  remaining: number
  count: number
}

export interface Totals {
  total: number
  paid: number
  remaining: number
  count: number
  byCurrency: Record<string, CurrencyTotals>
}

/** Суммы по направлению и по каждой валюте отдельно */
export function summarize(debts: Debt[]): Totals {
  const byCurrency: Record<string, CurrencyTotals> = {}
  const totals: Totals = { total: 0, paid: 0, remaining: 0, count: debts.length, byCurrency }

  for (const debt of debts) {
    const stats = getStats(debt)
    totals.total += debt.amount
    totals.paid += stats.paid
    totals.remaining += stats.remaining

    const key: CurrencyCode = debt.currency
    const bucket = (byCurrency[key] ??= { total: 0, paid: 0, remaining: 0, count: 0 })
    bucket.total += debt.amount
    bucket.paid += stats.paid
    bucket.remaining += stats.remaining
    bucket.count += 1
  }

  totals.total = round(totals.total)
  totals.paid = round(totals.paid)
  totals.remaining = round(totals.remaining)
  return totals
}

/** Сколько долгов в каждом статусе */
export function countByStatus(debts: Debt[]): Record<DebtStatus, number> {
  const counts: Record<DebtStatus, number> = { closed: 0, overdue: 0, soon: 0, active: 0 }
  for (const debt of debts) counts[getStats(debt).status] += 1
  return counts
}
