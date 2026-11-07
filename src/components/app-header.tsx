import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { resolveDark } from '@/lib/theme'

export function AppHeader() {
  const { settings, patchSettings } = useStore()
  const dark = resolveDark(settings.theme)

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
              <path
                d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17a3 3 0 0 1 3 3v1H6.5a1 1 0 0 0 0 2H20a2 2 0 0 1 2 2v4.5A2.5 2.5 0 0 1 19.5 20h-13A2.5 2.5 0 0 1 4 17.5v-10Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="16.5" cy="15.5" r="1.2" fill="currentColor" />
            </svg>
          </span>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-[15px] font-semibold">Долговая книжка</h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Долги, платежи и сроки в одном месте
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
            onClick={() => patchSettings({ theme: dark ? 'light' : 'dark' })}
          >
            {dark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </header>
  )
}
