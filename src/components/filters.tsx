import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FILTERS, SORTS, type FilterKey, type SortKey } from '@/lib/labels'

export function Filters({
  search,
  onSearch,
  filter,
  onFilter,
  sort,
  onSort,
}: {
  search: string
  onSearch: (value: string) => void
  filter: FilterKey
  onFilter: (value: FilterKey) => void
  sort: SortKey
  onSort: (value: SortKey) => void
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Поиск: название, имя, банк, телефон"
          className="h-11 pr-10 pl-9 md:h-9"
          type="search"
          aria-label="Поиск по долгам"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch('')}
            aria-label="Очистить поиск"
            className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Tabs
          value={filter}
          onValueChange={(value) => onFilter(value as FilterKey)}
          className="min-w-0 w-full flex-1"
        >
          <TabsList className="h-auto min-h-11 w-full flex-wrap justify-start gap-1 p-1.5 md:h-9 md:min-h-0 md:flex-nowrap md:p-[3px]">
            {FILTERS.map(({ key, label }) => (
              <TabsTrigger key={key} value={key} className="shrink-0 px-3">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={sort} onValueChange={(value) => onSort(value as SortKey)}>
          <SelectTrigger className="w-full shrink-0 sm:w-[9.5rem]" aria-label="Сортировка">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map(({ key, label }) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
