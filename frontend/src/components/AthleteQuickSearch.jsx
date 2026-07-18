/**
 * Global athlete quick-search — staff-only typeahead in the navbar.
 */
import { useState, useRef, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'
import { athletesAPI } from '../services/api'
import { parseListResponse } from '../utils/apiHelpers'
import Avatar from './Avatar'

export default function AthleteQuickSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef(null)
  const debounceRef = useRef(null)

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
    const onOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const pick = (athlete) => {
    setQuery('')
    setResults([])
    setOpen(false)
    onSelect?.(athlete.id)
  }

  return (
    <div className="quick-search-wrap d-none d-md-block" ref={wrapRef}>
      <div className="quick-search-input">
        <FaSearch />
        <input
          type="text"
          placeholder="Search athletes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
        />
      </div>
      {open && (
        <div className="quick-search-dropdown glass-card">
          {loading && <div className="quick-search-empty">Searching...</div>}
          {!loading && results.length === 0 && <div className="quick-search-empty">No athletes found.</div>}
          {!loading && results.map((a) => (
            <button type="button" key={a.id} className="quick-search-item" onClick={() => pick(a)}>
              <Avatar src={a.avatar_url || a.photo} name={a.full_name} size="xs" />
              <div>
                <strong>{a.full_name}</strong>
                <small>{a.sport}{a.team ? ` · ${a.team}` : ''}</small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
