import { cn } from 'cn'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DIRECTION_LABELS, KIND_LABELS } from '@/lib/labels'
import { getStats, progressClass, statusMeta } from '@/lib/status'
import type { ContactInfo, Debt, DebtKind, DebtStatus, Direction } from '@/lib/types'

/** Прогресс-бар со цветом по статусу долга */
export function ProgressBar({
  value,
  status = 'active',
  className,
  label,
}: {
  value: number
  status?: DebtStatus
  className?: string
  label?: string
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Прогресс ${pct}%`}
      className={cn(
        'relative h-2.5 w-full overflow-hidden rounded-full bg-primary/15',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', progressClass(status))}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/** Статус долга */
export function StatusPill({ debt }: { debt: Debt }) {
  const meta = statusMeta(debt, getStats(debt))
  return <Badge className={cn('border-transparent font-medium', meta.className)}>{meta.label}</Badge>
}

/** Направление долга */
export function DirectionPill({ direction }: { direction: Direction }) {
  const iOwe = direction === 'owe'
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent font-medium',
        iOwe
          ? 'bg-red-500/12 text-red-700 dark:text-red-400'
          : 'bg-sky-500/12 text-sky-700 dark:text-sky-400',
      )}
    >
      {DIRECTION_LABELS[direction]}
    </Badge>
  )
}

/** Тип контрагента */
export function KindPill({ kind }: { kind: DebtKind }) {
  return (
    <Badge variant="secondary" className="border-transparent">
      {KIND_LABELS[kind]}
    </Badge>
  )
}

/** Быстрые контакты: позвонить / телеграм / почта */
export function ContactActions({
  contact,
  className,
}: {
  contact: ContactInfo
  className?: string
}) {
  const items: { href: string; label: string; Icon: typeof Phone }[] = []

  if (contact.phone) {
    items.push({
      href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`,
      label: contact.phone,
      Icon: Phone,
    })
  }
  if (contact.telegram) {
    const handle = contact.telegram.replace(/^@/, '')
    items.push({ href: `https://t.me/${handle}`, label: contact.telegram, Icon: MessageCircle })
  }
  if (contact.email) {
    items.push({ href: `mailto:${contact.email}`, label: contact.email, Icon: Mail })
  }

  if (items.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noreferrer' : undefined}
          className="inline-flex h-9 max-w-full items-center gap-1.5 rounded-md border bg-background px-2.5 text-sm text-foreground transition-colors hover:bg-accent active:bg-accent"
        >
          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
        </a>
      ))}
    </div>
  )
}
