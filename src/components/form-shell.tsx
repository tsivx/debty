import type { ReactNode } from 'react'
import { cn } from 'cn'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

/**
 * Полноэкранный на мобилке лист формы и модальное окно на десктопе:
 * шапка → прокручиваемое тело → закреплённый футер.
 */
export function FormShell({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <DialogContent showCloseButton={false}>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3.5 sm:border-b-0 sm:px-6 sm:pt-6 sm:pb-0">
          <div className="min-w-0">
            <DialogTitle className="truncate text-lg">{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-1 text-sm">{description}</DialogDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Закрыть"
            className="-mr-2 shrink-0"
          >
            <X />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>

        <footer className="shrink-0 border-t bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
          {footer}
        </footer>
      </div>
    </DialogContent>
  )
}

/** Поле формы: подпись + контрол + подсказка/ошибка */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
