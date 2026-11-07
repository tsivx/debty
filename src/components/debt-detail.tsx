import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { ContactActions, DirectionPill, KindPill, ProgressBar, StatusPill } from '@/components/bits'
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
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { daysWord, formatDate, formatMoney, plural } from '@/lib/format'
import { paymentLabel } from '@/lib/labels'
import { getStats } from '@/lib/status'
import { useStore } from '@/lib/store'
import type { Debt } from '@/lib/types'
import { useLastNonNull } from '@/lib/use-last'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

export function DebtDetailSheet({
  open,
  debt,
  onClose,
  onEdit,
  onPay,
}: {
  open: boolean
  debt: Debt | null
  onClose: () => void
  onEdit: (debt: Debt) => void
  onPay: (debt: Debt) => void
}) {
  const { removeDebt, removePayment } = useStore()
  const lastDebt = useLastNonNull(debt)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!lastDebt) return null

  const stats = getStats(lastDebt)
  const closed = stats.status === 'closed'
  const percent = Math.round(stats.progress * 100)
  const payments = [...lastDebt.payments].sort((a, b) => (a.date < b.date ? 1 : -1))

  const dueLine = !lastDebt.dueDate
    ? 'Срок не указан'
    : stats.status === 'closed'
      ? `Срок был ${formatDate(lastDebt.dueDate)}`
      : stats.daysLeft !== null && stats.daysLeft < 0
        ? `Просрочен на ${daysWord(stats.daysLeft)}`
        : `${formatDate(lastDebt.dueDate)}${
            stats.daysLeft !== null ? ` · осталось ${daysWord(stats.daysLeft)}` : ''
          }`

  return (
    <>
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent
          showCloseButton={false}
          className="gap-0 overflow-hidden p-0"
        >
          <header className="flex shrink-0 items-start gap-3 border-b px-4 py-3.5 sm:px-5">
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-base">{lastDebt.title}</SheetTitle>
              <SheetDescription className="truncate text-sm">
                {lastDebt.counterparty}
              </SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Закрыть">
              <X />
            </Button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="flex flex-wrap gap-1.5">
              <DirectionPill direction={lastDebt.direction} />
              <KindPill kind={lastDebt.kind} />
              <StatusPill debt={lastDebt} />
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-3xl font-bold tabular-nums">
                  {formatMoney(stats.remaining, lastDebt.currency)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {closed ? 'закрыт' : 'осталось'}
                </span>
              </div>
              <ProgressBar value={stats.progress} status={stats.status} className="mt-2.5 h-3" />
              <div className="mt-1.5 flex justify-between gap-2 text-xs text-muted-foreground tabular-nums">
                <span>Оплачено {formatMoney(stats.paid, lastDebt.currency)}</span>
                <span>
                  {percent}% из {formatMoney(lastDebt.amount, lastDebt.currency)}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <InfoRow label="Крайний срок" value={dueLine} />
              <InfoRow label="Создан" value={formatDate(lastDebt.createdAt.slice(0, 10))} />
              <InfoRow label="Направление" value={lastDebt.direction === 'owe' ? 'Я должен' : 'Мне должны'} />
            </div>

            {lastDebt.description && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Зачем занимали</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{lastDebt.description}</p>
                </div>
              </>
            )}

            {(lastDebt.contact.phone ||
              lastDebt.contact.telegram ||
              lastDebt.contact.email ||
              lastDebt.contact.note) && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Контакты</p>
                  <ContactActions contact={lastDebt.contact} className="mt-2" />
                  {lastDebt.contact.note && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {lastDebt.contact.note}
                    </p>
                  )}
                </div>
              </>
            )}

            <Separator className="my-4" />

            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                История платежей ({payments.length})
              </p>
              <span className="text-xs text-muted-foreground tabular-nums">
                {plural(payments.length, ['платёж', 'платежа', 'платежей'])}
              </span>
            </div>

            {payments.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Платежей пока нет — внесите первый
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium tabular-nums">
                        {formatMoney(payment.amount, lastDebt.currency)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(payment.date)}
                        {payment.note ? ` · ${payment.note}` : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Удалить платёж"
                      onClick={() => removePayment(lastDebt.id, payment.id)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <footer className="shrink-0 border-t bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-5 sm:pb-4">
            <div className="flex gap-2">
              {!closed && (
                <Button className="flex-1" onClick={() => onPay(lastDebt)}>
                  <Plus /> {paymentLabel(lastDebt.direction)}
                </Button>
              )}
              <Button variant="outline" onClick={() => onEdit(lastDebt)} aria-label="Редактировать">
                <Pencil />
                <span className={closed ? '' : 'hidden sm:inline'}>Редактировать</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Удалить долг"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 />
              </Button>
            </div>
          </footer>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить долг?</AlertDialogTitle>
            <AlertDialogDescription>
              «{lastDebt.title}» и {payments.length}{' '}
              {plural(payments.length, ['платёж', 'платежа', 'платежей'])} будут удалены навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                removeDebt(lastDebt.id)
                onClose()
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
