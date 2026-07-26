import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

interface FilterOption { value: string; label: string }
interface Filter {
  key: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: FilterOption[]
}

interface SearchFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: Filter[]
  right?: ReactNode
}

export function SearchFilterBar({ search, onSearchChange, searchPlaceholder = 'Search...', filters = [], right }: SearchFilterBarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
        <Search size={16} className="shrink-0 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent font-body text-sm text-text outline-none placeholder:text-text-muted"
        />
      </div>

      {filters.map((f) => (
        <select
          key={f.key}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-3 font-body text-sm text-text outline-none focus:border-accent"
        >
          <option value="">{f.placeholder}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}

      {right && <div className="flex items-center gap-4 font-body text-sm text-text-secondary">{right}</div>}
    </div>
  )
}
