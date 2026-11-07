import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Filters } from '@/components/filters'
import { DebtCard } from '@/components/debt-card'
import { Summary } from '@/components/summary'
import { FILTERS, type FilterKey, type SortKey } from '@/lib/labels'
import { createDemoDebts } from '@/lib/seed'
import { getStats } from '@/lib/status'
import { useStore } from '@/lib/store'
import type { Debt } from '@/lib/types'
import { Plus, SearchX, Sparkles, Wallet } from 'lucide-react'
import { toast } from 'sonner'

function normalize(value: string): string {
  return value.toLowerCase().trim()
}

function digits(value: string): string {
  return value.replace(/\D/g, '')
}

function matches(debt: Debt, query: string): boolean {
  const q = normalize(query)
  if (!q) return true
  const qDigits = digits(q)

  const haystack = [debt.title, debt.counterparty, debt.description ?? ''].some((field) =>
    normalize(field).includes(q),
  )
  if (haystack) return true

  const contact = [debt.contact.phone, debt.contact.email, debt.contact.telegram, debt.contact.note]
    .filter(Boolean)
    .join(' ')
  if (normalize(contact).includes(q)) return true
  if (qDigits.length >= 3 && digits(contact).includes(qDigits)) return true
  return false
}

function applyFilter(debts: Debt[], filter: FilterKey): Debt[] {
  switch (filter) {
    case 'all':
      return debts
    case 'owe':
      return debts.filter((debt) => debt.direction === 'owe')
    case 'owed':
      return debts.filter((debt) => debt.direction === 'owed')
    case 'overdue':
      return debts.filter((debt) => getStats(debt).status === 'overdue')
    case 'closed':
      return debts.filter((debt) => getStats(debt).status === 'closed')
  }
}

function applySort(debts: Debt[], sort: SortKey): Debt[] {
  const copy = [...debts]
  copy.sort((a, b) => {
    switch (sort) {
      case 'due': {
        const da = a.dueDate ?? '9999-12-31'
        const db = b.dueDate ?? '9999-12-31'
        return da === db ? 0 : da < db ? -1 : 1
      }
      case 'amount':
        return getStats(b).remaining - getStats(a).remaining
      case 'progress':
        return getStats(a).progress - getStats(b).progress
      case 'title':
        return a.title.localeCompare(b.title, 'ru')
    }
  })
  return copy
}

export function HomeScreen({
  onOpen,
  onEdit,
  onPay,
  onAdd,
}: {
  onOpen: (debt: Debt) => void
  onEdit: (debt: Debt) => void
  onPay: (debt: Debt) => void
  onAdd: () => void
}) {
  const { debts, replaceAll, removeDebt } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('due')

  const visible = useMemo(() => {
    const filtered = applyFilter(debts, filter).filter((debt) => matches(debt, search))
    return applySort(filtered, sort)
  }, [debts, filter, search, sort])

  const activeFilters = FILTERS.find((item) => item.key === filter)?.label

  function loadDemo() {
    replaceAll([...createDemoDebts(), ...debts])
    toast.success('Демо-данные добавлены', { description: 'Их можно удалить в настройках' })
  }

  return (
    <div className="space-y-4">
      <Summary debts={debts} />

      <Filters
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={setFilter}
        sort={sort}
        onSort={setSort}
      />

      {debts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Wallet />
            </EmptyMedia>
            <EmptyTitle>Долгов пока нет</EmptyTitle>
            <EmptyDescription>
              Добавьте первый долг — кредитку, заём у друга или любую другую запись. Здесь будут
              суммы, сроки и история платежей.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={onAdd}>
                <Plus /> Добавить долг
              </Button>
              <Button variant="outline" onClick={loadDemo}>
                <Sparkles /> Загрузить примеры
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      ) : visible.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>Ничего не найдено</EmptyTitle>
            <EmptyDescription>
              По запросу «{search || activeFilters}» нет подходящих долгов. Попробуйте изменить
              фильтр или очистить поиск.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setFilter('all')
              }}
            >
              Сбросить фильтры
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onOpen={() => onOpen(debt)}
              onEdit={() => onEdit(debt)}
              onPay={() => onPay(debt)}
              onDelete={() => removeDebt(debt.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
