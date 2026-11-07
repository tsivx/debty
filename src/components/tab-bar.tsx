import { cn } from 'cn'
import { History, House, Settings } from 'lucide-react'

export type Tab = 'home' | 'history' | 'settings'

const TABS = [
  { key: 'home', label: 'Главная', Icon: House },
  { key: 'history', label: 'История', Icon: History },
  { key: 'settings', label: 'Настройки', Icon: Settings },
] as const

export function TabBar({
  value,
  onChange,
}: {
  value: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <nav
      aria-label="Основная навигация"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3">
        {TABS.map(({ key, label, Icon }) => {
          const active = value === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
