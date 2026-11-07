import { useEffect, useState } from 'react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Field, FormShell } from '@/components/form-shell'
import { formatMoney, symbolOf, todayISO } from '@/lib/format'
import { paymentTitle } from '@/lib/labels'
import { getStats } from '@/lib/status'
import { useStore } from '@/lib/store'
import type { Debt } from '@/lib/types'
import { useLastNonNull } from '@/lib/use-last'
import { parseAmount } from '@/components/debt-form'
import { toast } from 'sonner'

const QUICK_RATIOS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: 'Всё', value: 1 },
] as const

export function PaymentDialog({
  open,
  debt,
  onClose,
}: {
  open: boolean
  debt: Debt | null
  onClose: () => void
}) {
  const { addPayment } = useStore()
  const lastDebt = useLastNonNull(debt)

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (open) {
      setAmount('')
      setDate(todayISO())
      setNote('')
      setError(undefined)
    }
  }, [open])

  if (!lastDebt) return null

  const stats = getStats(lastDebt)
  const remaining = stats.remaining
  const currency = lastDebt.currency
  const parsed = parseAmount(amount)
  const sliderValue = Number.isFinite(parsed) ? Math.min(parsed, remaining) : 0

  const setQuick = (ratio: number) => {
    const value = Math.round(remaining * ratio * 100) / 100
    setAmount(String(value))
    setError(undefined)
  }

  const submit = () => {
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Укажите сумму платежа')
      return
    }
    if (parsed > remaining + 0.005) {
      setError(`Больше остатка (${formatMoney(remaining, currency)})`)
      return
    }

    addPayment(lastDebt.id, {
      amount: parsed,
      date,
      note: note.trim() || undefined,
    })

    const closing = parsed >= remaining - 0.005
    if (closing) {
      toast.success('Долг закрыт', { description: `«${lastDebt.title}» больше не должен` })
    } else {
      toast.success(`Записан платёж ${formatMoney(parsed, currency)}`, {
        description: `Остаток: ${formatMoney(remaining - parsed, currency)}`,
      })
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <FormShell
        title={paymentTitle(lastDebt.direction)}
        description={`${lastDebt.title} · ${lastDebt.counterparty}`}
        onClose={onClose}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={submit}>Записать платёж</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-muted-foreground">Остаток долга</span>
              <span className="text-xl font-bold tabular-nums">
                {formatMoney(remaining, currency)}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground tabular-nums">
              Оплачено {formatMoney(stats.paid, currency)} из{' '}
              {formatMoney(lastDebt.amount, currency)}
            </div>
          </div>

          <Field label="Сумма платежа" htmlFor="payment-amount" error={error}>
            <div className="relative">
              <Input
                id="payment-amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value)
                  setError(undefined)
                }}
                placeholder="0"
                aria-invalid={Boolean(error)}
                className="h-12 pr-16 text-lg font-semibold tabular-nums md:h-10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {symbolOf(currency)}
              </span>
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-2">
            {QUICK_RATIOS.map(({ label, value }) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                onClick={() => setQuick(value)}
                disabled={remaining <= 0}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{formatMoney(remaining, currency)}</span>
            </div>
            <Slider
              value={[sliderValue]}
              min={0}
              max={Math.max(remaining, 1)}
              step={Math.max(1, Math.round(remaining / 200))}
              onValueChange={(values) => {
                const next = values[0] ?? 0
                setAmount(String(Math.round(next * 100) / 100))
                setError(undefined)
              }}
              aria-label="Сумма платежа"
              disabled={remaining <= 0}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Дата платежа" htmlFor="payment-date">
              <Input
                id="payment-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            <Field label="Заметка" htmlFor="payment-note">
              <Input
                id="payment-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Например: наличными"
              />
            </Field>
          </div>

          <p
            className={cn(
              'rounded-lg border border-dashed p-3 text-xs text-muted-foreground',
            )}
          >
            Оплата уменьшает остаток и двигает прогресс-бар. Когда остаток станет нулём, долг
            автоматически закроется.
          </p>
        </div>
      </FormShell>
    </Dialog>
  )
}
