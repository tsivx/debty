import { CalendarClock, Flame, ListChecks, TriangleAlert } from 'lucide-react'
import { ProgressBar } from '@/components/bits'
import { daysWord, formatMoney, formatDateShort, plural } from '@/lib/format'
import { countByStatus, getStats, summarize } from '@/lib/status'
import type { CurrencyCode, Debt, DebtStatus, Direction } from '@/lib/types'
import { DIRECTION_LABELS } from '@/lib/labels'
import { cn } from 'cn'

/** Худший статус среди долгов — для цвета общего прогресс-бара */
function worstStatus(debts: Debt[]): DebtStatus {
  if (debts.length > 0 && debts.every((d) => getStats(d).status === 'closed')) return 'closed'
  if (debts.some((d) => getStats(d).status === 'overdue')) return 'overdue'
  if (debts.some((d) => getStats(d).status === 'soon')) return 'soon'
  return 'active'
}

function SummaryBlock({ direction, debts }: { direction: Direction; debts: Debt[] }) {
  const totals = summarize(debts)
  const currencies = Object.entries(totals.byCurrency)
  const status = worstStatus(debts)
  const iOwe = direction === 'owe'
  const paidWord = iOwe ? 'Оплачено' : 'Вернули'

  return (
    <section className="rounded-xl border bg-card p-4 shadow-xs">
      <header className="flex items-center justify-between gap-2">
        <h2
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            iOwe ? 'text-red-700 dark:text-red-400' : 'text-sky-700 dark:text-sky-400',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'grid size-5 place-items-center rounded-md',
              iOwe ? 'bg-red-500/15' : 'bg-sky-500/15',
            )}
          >
            {iOwe ? '↑' : '↓'}
          </span>
          {DIRECTION_LABELS[direction]}
        </h2>
        <span className="text-xs text-muted-foreground">
          {debts.length} {plural(debts.length, ['долг', 'долга', 'долгов'])}
        </span>
      </header>

      {currencies.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Пока пусто</p>
      ) : (
        <div className="mt-3 space-y-4">
          {currencies.map(([code, bucket]) => {
            const progress = bucket.total > 0 ? bucket.paid / bucket.total : 0
            return (
              <div key={code}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold tabular-nums">
                    {formatMoney(bucket.remaining, code as CurrencyCode)}
                  </span>
                  <span className="text-xs text-muted-foreground">осталось</span>
                </div>
                <ProgressBar
                  value={progress}
                  status={status}
                  className="mt-2 h-3"
                  label={`${DIRECTION_LABELS[direction]}: ${Math.round(progress * 100)}%`}
                />
                <div className="mt-1.5 flex justify-between gap-2 text-xs text-muted-foreground tabular-nums">
                  <span>
                    {paidWord} {formatMoney(bucket.paid, code as CurrencyCode)}
                  </span>
                  <span>из {formatMoney(bucket.total, code as CurrencyCode)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: typeof Flame
  label: string
  value: string
  tone?: 'default' | 'danger' | 'warning'
}) {
  return (
    <div className="rounded-xl border bg-card p-3 shadow-xs">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon
          className={cn(
            'size-3.5',
            tone === 'danger' && 'text-destructive',
            tone === 'warning' && 'text-amber-600 dark:text-amber-400',
          )}
        />
        {label}
      </div>
      <div className="mt-1 truncate text-lg font-semibold tabular-nums">{value}</div>
    </div>
  )
}

export function Summary({ debts }: { debts: Debt[] }) {
  const iOwe = debts.filter((d) => d.direction === 'owe')
  const owed = debts.filter((d) => d.direction === 'owed')
  const counts = countByStatus(debts)

  const withDeadline = debts
    .filter((d) => d.dueDate && getStats(d).status !== 'closed')
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))

  const nearest = withDeadline[0]
  const nearestDays = nearest ? getStats(nearest).daysLeft : null
  const activeCount = debts.length - counts.closed

  let nearestValue = '—'
  let nearestLabel = 'Ближайший срок'
  if (nearest?.dueDate) {
    nearestValue = formatDateShort(nearest.dueDate)
    if (nearestDays !== null && nearestDays < 0) {
      nearestLabel = `Просрочен на ${daysWord(nearestDays)}`
    } else if (nearestDays !== null) {
      nearestLabel = daysWord(nearestDays)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryBlock direction="owe" debts={iOwe} />
        <SummaryBlock direction="owed" debts={owed} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={ListChecks} label="Активных" value={String(activeCount)} />
        <Metric
          icon={TriangleAlert}
          label="Просрочено"
          value={String(counts.overdue)}
          tone={counts.overdue > 0 ? 'danger' : 'default'}
        />
        <Metric
          icon={Flame}
          label="Горит срок"
          value={String(counts.soon)}
          tone={counts.soon > 0 ? 'warning' : 'default'}
        />
        <Metric icon={CalendarClock} label={nearestLabel} value={nearestValue} />
      </div>
    </div>
  )
}
