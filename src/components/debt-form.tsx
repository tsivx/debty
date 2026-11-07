import { useEffect, useState } from 'react'
import { cn } from 'cn'
import { CalendarDays, X } from 'lucide-react'
import { ru } from 'react-day-picker/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field, FormShell } from '@/components/form-shell'
import { CURRENCIES, formatDate, parseISODate, toISODate } from '@/lib/format'
import { CURRENCY_LABELS, DIRECTION_LABELS, KIND_LABELS } from '@/lib/labels'
import { useStore } from '@/lib/store'
import type { CurrencyCode, Debt, DebtKind, Direction } from '@/lib/types'
import { toast } from 'sonner'

interface FormState {
  direction: Direction
  title: string
  kind: DebtKind
  counterparty: string
  amount: string
  currency: CurrencyCode
  dueDate: string | null
  description: string
  phone: string
  email: string
  telegram: string
  contactNote: string
}

const EMPTY: FormState = {
  direction: 'owe',
  title: '',
  kind: 'person',
  counterparty: '',
  amount: '',
  currency: 'RUB',
  dueDate: null,
  description: '',
  phone: '',
  email: '',
  telegram: '',
  contactNote: '',
}

function initialState(debt: Debt | null, defaultCurrency: CurrencyCode): FormState {
  if (!debt) return { ...EMPTY, currency: defaultCurrency }
  return {
    direction: debt.direction,
    title: debt.title,
    kind: debt.kind,
    counterparty: debt.counterparty,
    amount: String(debt.amount),
    currency: debt.currency,
    dueDate: debt.dueDate ?? null,
    description: debt.description ?? '',
    phone: debt.contact.phone ?? '',
    email: debt.contact.email ?? '',
    telegram: debt.contact.telegram ?? '',
    contactNote: debt.contact.note ?? '',
  }
}

export function parseAmount(value: string): number {
  const normalized = value.replace(/\s|[^0-9.,-]/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

export function DebtFormDialog({
  open,
  debt,
  onClose,
}: {
  open: boolean
  debt: Debt | null
  onClose: () => void
}) {
  const { addDebt, updateDebt, settings } = useStore()
  const [form, setForm] = useState<FormState>(() => initialState(debt, settings.defaultCurrency))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [dateOpen, setDateOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialState(debt, settings.defaultCurrency))
      setErrors({})
    }
    // Сбрасываем форму при каждом открытии
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debt?.id])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function submit() {
    const nextErrors: typeof errors = {}
    if (!form.title.trim()) nextErrors.title = 'Укажите название долга'
    const amount = parseAmount(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) nextErrors.amount = 'Сумма должна быть больше нуля'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      direction: form.direction,
      title: form.title.trim(),
      kind: form.kind,
      counterparty: form.counterparty.trim() || (form.kind === 'bank' ? 'Банк' : 'Без названия'),
      amount,
      currency: form.currency,
      dueDate: form.dueDate ?? undefined,
      description: form.description.trim() || undefined,
      contact: {
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        telegram: form.telegram.trim() || undefined,
        note: form.contactNote.trim() || undefined,
      },
    }

    if (debt) {
      updateDebt(debt.id, payload)
      toast.success('Долг обновлён')
    } else {
      addDebt(payload)
      toast.success('Долг добавлен')
    }
    onClose()
  }

  const iOwe = form.direction === 'owe'

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <FormShell
        title={debt ? 'Редактировать долг' : 'Новый долг'}
        description={
          iOwe ? 'Долг, который нужно вернуть' : 'Долг, который вам должны вернуть'
        }
        onClose={onClose}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={submit}>{debt ? 'Сохранить' : 'Добавить долг'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Кому/кто должен">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              {(['owe', 'owed'] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  aria-pressed={form.direction === direction}
                  onClick={() => set('direction', direction)}
                  className={cn(
                    'h-10 rounded-md text-sm font-medium transition-colors',
                    form.direction === direction
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground',
                  )}
                >
                  {DIRECTION_LABELS[direction]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Название" htmlFor="debt-title" error={errors.title}>
            <Input
              id="debt-title"
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder={iOwe ? 'Кредитка Т-Банк' : 'Долг Кирилла'}
              aria-invalid={Boolean(errors.title)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Тип" htmlFor="debt-kind">
              <Select value={form.kind} onValueChange={(value) => set('kind', value as DebtKind)}>
                <SelectTrigger id="debt-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['person', 'bank', 'other'] as const).map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {KIND_LABELS[kind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label={iOwe ? 'Кому я должен' : 'Кто мне должен'}
              htmlFor="debt-counterparty"
            >
              <Input
                id="debt-counterparty"
                value={form.counterparty}
                onChange={(event) => set('counterparty', event.target.value)}
                placeholder={iOwe ? 'Андрей Соколов / Т-Банк' : 'Кирилл Волков'}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
            <Field label="Сумма" htmlFor="debt-amount" error={errors.amount}>
              <Input
                id="debt-amount"
                inputMode="decimal"
                value={form.amount}
                onChange={(event) => set('amount', event.target.value)}
                placeholder="50000"
                aria-invalid={Boolean(errors.amount)}
                className="tabular-nums"
              />
            </Field>

            <Field label="Валюта" htmlFor="debt-currency">
              <Select
                value={form.currency}
                onValueChange={(value) => set('currency', value as CurrencyCode)}
              >
                <SelectTrigger id="debt-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(({ code, flag }) => (
                    <SelectItem key={code} value={code}>
                      {flag} {CURRENCY_LABELS[code]} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Крайний срок" hint="Можно оставить пустым">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  <span className={cn(!form.dueDate && 'text-muted-foreground')}>
                    {form.dueDate ? formatDate(form.dueDate) : 'Выберите дату'}
                  </span>
                  <CalendarDays className="size-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={ru}
                  mode="single"
                  selected={form.dueDate ? parseISODate(form.dueDate) : undefined}
                  onSelect={(date) => {
                    set('dueDate', date ? toISODate(date) : null)
                    setDateOpen(false)
                  }}
                />
                <div className="flex items-center justify-between gap-2 border-t p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      set('dueDate', null)
                      setDateOpen(false)
                    }}
                  >
                    <X /> Без срока
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      set('dueDate', toISODate(new Date()))
                      setDateOpen(false)
                    }}
                  >
                    Сегодня
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </Field>

          <Field label="Зачем занимали" htmlFor="debt-description">
            <Textarea
              id="debt-description"
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              placeholder="Например: на ремонт кухни, обещал вернуть частями"
              rows={3}
            />
          </Field>

          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Контакты — чтобы быстро найти человека
            </p>
            <div className="space-y-3">
              <Field label="Телефон" htmlFor="debt-phone">
                <Input
                  id="debt-phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => set('phone', event.target.value)}
                  placeholder="+7 999 123-45-67"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Telegram" htmlFor="debt-telegram">
                  <Input
                    id="debt-telegram"
                    value={form.telegram}
                    onChange={(event) => set('telegram', event.target.value)}
                    placeholder="@username"
                  />
                </Field>
                <Field label="Почта" htmlFor="debt-email">
                  <Input
                    id="debt-email"
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(event) => set('email', event.target.value)}
                    placeholder="mail@example.com"
                  />
                </Field>
              </div>
              <Field label="Заметка о контакте" htmlFor="debt-contact-note">
                <Input
                  id="debt-contact-note"
                  value={form.contactNote}
                  onChange={(event) => set('contactNote', event.target.value)}
                  placeholder="Лучше звонить вечером"
                />
              </Field>
            </div>
          </div>
        </div>
      </FormShell>
    </Dialog>
  )
}
