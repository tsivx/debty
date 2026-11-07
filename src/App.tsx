import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { AppHeader } from '@/components/app-header'
import { DebtDetailSheet } from '@/components/debt-detail'
import { DebtFormDialog } from '@/components/debt-form'
import { Fab } from '@/components/fab'
import { PaymentDialog } from '@/components/payment-dialog'
import { HistoryScreen } from '@/components/screens/history'
import { HomeScreen } from '@/components/screens/home'
import { SettingsScreen } from '@/components/screens/settings'
import { TabBar, type Tab } from '@/components/tab-bar'
import { StoreProvider, useStore } from '@/lib/store'
import type { Debt } from '@/lib/types'

function AppInner() {
  const { debts } = useStore()

  const [tab, setTab] = useState<Tab>('home')

  // При смене таба возвращаемся к началу страницы
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])
  const [formState, setFormState] = useState<{ open: boolean; debt: Debt | null }>({
    open: false,
    debt: null,
  })
  const [payDebt, setPayDebt] = useState<Debt | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  // Данные перечитываем из стора, чтобы панель всегда показывала актуальное состояние
  const detail = detailId ? (debts.find((debt) => debt.id === detailId) ?? null) : null
  const pay = payDebt ? (debts.find((debt) => debt.id === payDebt.id) ?? null) : null

  function openForm(debt: Debt | null) {
    setFormState({ open: true, debt })
  }

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-32 sm:px-6">
        {tab === 'home' && (
          <HomeScreen
            onOpen={(debt) => setDetailId(debt.id)}
            onEdit={(debt) => openForm(debt)}
            onPay={(debt) => setPayDebt(debt)}
            onAdd={() => openForm(null)}
          />
        )}
        {tab === 'history' && <HistoryScreen onOpen={(debt) => setDetailId(debt.id)} />}
        {tab === 'settings' && <SettingsScreen />}
      </main>

      {tab !== 'settings' && <Fab onClick={() => openForm(null)} />}
      <TabBar value={tab} onChange={setTab} />

      <DebtFormDialog
        open={formState.open}
        debt={formState.debt}
        onClose={() => setFormState({ open: false, debt: null })}
      />

      <PaymentDialog open={pay !== null} debt={pay} onClose={() => setPayDebt(null)} />

      <DebtDetailSheet
        open={detail !== null}
        debt={detail}
        onClose={() => setDetailId(null)}
        onEdit={(debt) => {
          setDetailId(null)
          openForm(debt)
        }}
        onPay={(debt) => {
          setDetailId(null)
          setPayDebt(debt)
        }}
      />

      <Toaster position="top-center" richColors closeButton toastOptions={{ duration: 3200 }} />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}
