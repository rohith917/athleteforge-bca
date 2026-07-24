import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { athletesAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { Avatar } from '@/components/ui/Avatar'
import type { AthleteListItem } from '@/types'

export function AthleteQuickSearch({ onSelect }: { onSelect: (id: number) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AthleteListItem[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await athletesAPI.getAll({ search: query.trim() })
        setResults(parseListResponse(res.data))
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const pick = (athlete: AthleteListItem) => {
    setQuery('')
    setResults([])
    setOpen(false)
    onSelect(athlete.id)
  }

  return (
    <div className="relative hidden w-72 md:block" ref={wrapRef}>
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5">
        <Search size={15} className="shrink-0 text-text-muted" />
        <input
          type="text"
          placeholder="Search athletes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          className="w-full bg-transparent font-body text-sm text-text outline-none placeholder:text-text-muted"
        />
      </div>
      {open && (
        <div className="glass absolute left-0 top-12 z-40 max-h-80 w-full overflow-y-auto rounded-2xl shadow-2xl">
          {loading && <div className="px-4 py-4 font-body text-xs text-text-muted">Searching...</div>}
          {!loading && results.length === 0 && (
            <div className="px-4 py-4 font-body text-xs text-text-muted">No athletes found.</div>
          )}
          {!loading && results.map((a) => (
            <button
              type="button"
              key={a.id}
              onClick={() => pick(a)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
              <Avatar src={a.avatar_url} name={a.full_name} size="xs" />
              <div className="min-w-0">
                <strong className="block truncate font-body text-sm text-text">{a.full_name}</strong>
                <small className="block truncate font-body text-xs text-text-muted">
                  {a.sport}{a.team ? ` · ${a.team}` : ''}
                </small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
