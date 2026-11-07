import { useRef, useState } from 'react'
import { cn } from 'cn'
import {
  Download,
  FileJson,
  Monitor,
  Moon,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Smartphone,
} from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CURRENCIES, todayISO } from '@/lib/format'
import { CURRENCY_LABELS } from '@/lib/labels'
import { useInstallPrompt } from '@/lib/pwa'
import { createDemoDebts } from '@/lib/seed'
import { useStore } from '@/lib/store'
import type { BackupFile, CurrencyCode, Debt, Settings as SettingsType } from '@/lib/types'
import { toast } from 'sonner'

const THEMES: { key: SettingsType['theme']; label: string; Icon: typeof Sun }[] = [
  { key: 'light', label: 'Светлая', Icon: Sun },
  { key: 'dark', label: 'Тёмная', Icon: Moon },
  { key: 'system', label: 'Системная', Icon: Monitor },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">{title}</h2>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function SettingsScreen() {
  const { debts, settings, patchSettings, replaceAll, clearAll } = useStore()
  const { available: canInstall, installed, install } = useInstallPrompt()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<BackupFile | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  function exportData() {
    const backup: BackupFile = {
      app: 'debty',
      version: 1,
      exportedAt: new Date().toISOString(),
      debts,
      settings,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `debty-${todayISO()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Резервная копия сохранена', { description: 'Файл скачан на устройство' })
  }

  async function importFile(file: File) {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as BackupFile
      if (parsed?.app !== 'debty' || !Array.isArray(parsed.debts)) {
        throw new Error('bad-format')
      }
      setPendingImport(parsed)
    } catch {
      toast.error('Не удалось прочитать файл', {
        description: 'Ожидается резервная копия, созданная в этом приложении',
      })
    }
  }

  function applyImport() {
    if (!pendingImport) return
    replaceAll(pendingImport.debts as Debt[], pendingImport.settings)
    setPendingImport(null)
    toast.success('Данные восстановлены', {
      description: `${pendingImport.debts.length} долгов импортировано`,
    })
  }

  function loadDemo() {
    replaceAll([...createDemoDebts(), ...debts])
    toast.success('Демо-данные добавлены')
  }

  return (
    <div className="space-y-4">
      <Section title="Внешний вид" description="Тема оформления приложения">
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
          {THEMES.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              aria-pressed={settings.theme === key}
              onClick={() => patchSettings({ theme: key })}
              className={cn(
                'flex h-10 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors',
                settings.theme === key
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Валюта по умолчанию"
        description="Подставляется при создании нового долга"
      >
        <Select
          value={settings.defaultCurrency}
          onValueChange={(value) => patchSettings({ defaultCurrency: value as CurrencyCode })}
        >
          <SelectTrigger className="w-full" aria-label="Валюта по умолчанию">
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
      </Section>

      <Section
        title="Данные"
        description="Хранятся только в этом браузере — делайте резервные копии"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={exportData} disabled={debts.length === 0}>
            <Download /> Экспорт (JSON)
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload /> Импорт (JSON)
          </Button>
          <Button variant="outline" onClick={loadDemo}>
            <Sparkles /> Добавить демо-данные
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmClear(true)}
            disabled={debts.length === 0}
          >
            <Trash2 /> Очистить всё
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void importFile(file)
            event.target.value = ''
          }}
        />
      </Section>

      <Section title="Установка" description="Полноэкранное приложение без адресной строки">
        {installed ? (
          <p className="text-sm text-muted-foreground">
            Приложение уже установлено на устройство.
          </p>
        ) : canInstall ? (
          <Button
            onClick={async () => {
              const result = await install()
              if (result === 'accepted') toast.success('Приложение установлено')
            }}
          >
            <Smartphone /> Установить приложение
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Откройте сайт в Chrome или Safari и выберите «На экран “Домой”» — приложение
            заработает офлайн.
          </p>
        )}
      </Section>

      <Section title="О приложении">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Долговая книжка</span> · версия 1.0
          </p>
          <p>
            Долги, платежи и сроки. Данные не покидают устройство: приложение хранит их локально
            и работает без интернета.
          </p>
          <p className="flex items-center gap-1.5">
            <FileJson className="size-4" />
            Всего записей: {debts.length}
          </p>
        </div>
      </Section>

      <Separator />

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистить все данные?</AlertDialogTitle>
            <AlertDialogDescription>
              Будут удалены все {debts.length} долгов и платежи. Это действие необратимо —
              сначала сделайте экспорт.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                clearAll()
                toast.success('Все данные удалены')
              }}
            >
              Очистить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingImport !== null}
        onOpenChange={(next) => !next && setPendingImport(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Заменить текущие данные?</AlertDialogTitle>
            <AlertDialogDescription>
              В файле {pendingImport?.debts.length ?? 0} долгов. Текущие записи ({debts.length})
              будут полностью заменены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={applyImport}>Импортировать</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
