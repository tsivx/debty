import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatMoney } from '@/lib/format'
import { useStore } from '@/lib/store'
import type { CurrencyCode, Debt, Direction, Payment } from '@/lib/types'
import { cn } from 'cn'

interface Row {
  payment: Payment
  debt: Debt
}

type DirectionFilter = 'all' | Direction

export function HistoryScreen({ onOpen }: { onOpen: (debt: Debt) => void }) {
  const { debts } = useStore()
  const [debtFilter, setDebtFilter] = useState('all')
  const [direction, setDirection] = useState<DirectionFilter>('all')

  const rows = useMemo(() => {
    const items: Row[] = []
    for (const debt of debts) {
      if (debtFilter !== 'all' && debt.id !== debtFilter) continue
      if (direction !== 'all' && debt.direction !== direction) continue
      for (const payment of debt.payments) items.push({ payment, debt })
    }
    items.sort((a, b) => (a.payment.date === b.payment.date ? 0 : a.payment.date < b.payment.date ? 1 : -1))
    return items
  }, [debts, debtFilter, direction])

  const totals = useMemo(() => {
    const byCurrency: Record<string, number> = {}
    for (const row of rows) {
      byCurrency[row.debt.currency] = (byCurrency[row.debt.currency] ?? 0) + row.payment.amount
    }
    return Object.entries(byCurrency)
  }, [rows])

  const debtOptions = debts.filter((debt) => debt.payments.length > 0)

  if (debts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Receipt />
          </EmptyMedia>
          <EmptyTitle>История пуста</EmptyTitle>
          <EmptyDescription>
            Здесь появятся все платежи по вашим долгам — когда платили, сколько и по какому долгу.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-card p-4 shadow-xs">
        <h2 className="text-sm font-medium text-muted-foreground">Всего платежей</h2>
        <p className="mt-1 text-2xl font-bold tabular-nums">{rows.length}</p>
        {totals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground tabular-nums">
            {totals.map(([code, sum]) => (
              <span key={code}>
                {formatMoney(sum, code as CurrencyCode)}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="space-y-3">
        <Select value={debtFilter} onValueChange={setDebtFilter}>
          <SelectTrigger className="w-full" aria-label="Фильтр по долгу">
            <SelectValue placeholder="Все долги" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все долги</SelectItem>
            {debtOptions.map((debt) => (
              <SelectItem key={debt.id} value={debt.id}>
                {debt.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs
          value={direction}
          onValueChange={(value) => setDirection(value as DirectionFilter)}
        >
          <TabsList className="h-11 w-full md:h-9">
            <TabsTrigger value="all" className="flex-1">
              Все
            </TabsTrigger>
            <TabsTrigger value="owe" className="flex-1">
              Я должен
            </TabsTrigger>
            <TabsTrigger value="owed" className="flex-1">
              Мне должны
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          По выбранным фильтрам платежей нет
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map(({ payment, debt }) => {
            const iOwe = debt.direction === 'owe'
            return (
              <li key={payment.id}>
                <button
                  type="button"
                  onClick={() => onOpen(debt)}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-xs transition-colors hover:border-ring/40"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-full',
                      iOwe ? 'bg-red-500/12 text-red-700 dark:text-red-400' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
                    )}
                  >
                    {iOwe ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{debt.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatDate(payment.date)}
                      {payment.note ? ` · ${payment.note}` : ''}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
                    {iOwe ? '−' : '+'}
                    {formatMoney(payment.amount, debt.currency)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
