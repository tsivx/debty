import { useState } from 'react'
import { cn } from 'cn'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { ContactActions, DirectionPill, KindPill, ProgressBar, StatusPill } from '@/components/bits'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { daysWord, formatMoney, formatDateShort, plural } from '@/lib/format'
import { paymentLabel } from '@/lib/labels'
import { getStats } from '@/lib/status'
import type { Debt } from '@/lib/types'

function dueText(debt: Debt): string {
  if (!debt.dueDate) return 'Без срока'
  const stats = getStats(debt)
  const date = formatDateShort(debt.dueDate)
  if (stats.status === 'closed') return `Срок был ${date}`
  if (stats.daysLeft === null) return `Срок ${date}`
  if (stats.daysLeft < 0) return `Просрочен на ${daysWord(stats.daysLeft)}`
  if (stats.daysLeft === 0) return `Срок сегодня`
  return `Срок ${date} · ${daysWord(stats.daysLeft)}`
}

export function DebtCard({
  debt,
  onOpen,
  onEdit,
  onPay,
  onDelete,
}: {
  debt: Debt
  onOpen: () => void
  onEdit: () => void
  onPay: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const stats = getStats(debt)
  const closed = stats.status === 'closed'
  const percent = Math.round(stats.progress * 100)

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer rounded-xl border bg-card p-4 shadow-xs transition-colors hover:border-ring/40"
    >
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <DirectionPill direction={debt.direction} />
          <KindPill kind={debt.kind} />
        </div>
        <StatusPill debt={debt} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Действия с долгом"
              className="-mr-1 shrink-0"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil /> Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 /> Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="mt-2 truncate text-base font-semibold">{debt.title}</h3>
      <p className="truncate text-sm text-muted-foreground">{debt.counterparty}</p>

      {debt.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{debt.description}</p>
      )}

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span
          className={cn(
            'text-xl font-bold tabular-nums',
            closed && 'text-emerald-700 dark:text-emerald-400',
          )}
        >
          {formatMoney(stats.remaining, debt.currency)}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {closed ? 'закрыт' : `из ${formatMoney(debt.amount, debt.currency)}`}
        </span>
      </div>

      <ProgressBar
        value={stats.progress}
        status={stats.status}
        className="mt-2"
        label={`${debt.title}: ${percent}%`}
      />
      <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {closed ? `${percent}%` : `Оплачено ${percent}%`}
        </span>
        <span className="truncate">{dueText(debt)}</span>
      </div>

      <div className="mt-3 flex gap-2" onClick={(event) => event.stopPropagation()}>
        {!closed && (
          <Button className="flex-1" onClick={onPay}>
            {paymentLabel(debt.direction)}
          </Button>
        )}
        <Button
          variant={closed ? 'default' : 'outline'}
          className={closed ? 'flex-1' : ''}
          onClick={onOpen}
        >
          Подробнее
        </Button>
      </div>

      <div onClick={(event) => event.stopPropagation()}>
        <ContactActions contact={debt.contact} className="mt-3" />
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить долг?</AlertDialogTitle>
            <AlertDialogDescription>
              «{debt.title}» и все платежи по нему ({debt.payments.length}{' '}
              {plural(debt.payments.length, ['платёж', 'платежа', 'платежей'])}) будут удалены
              навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}
