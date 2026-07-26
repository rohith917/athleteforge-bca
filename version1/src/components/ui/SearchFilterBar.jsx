/**
 * Shared search + filter bar for list pages (Athletes, Performance, Injuries, Competitions).
 */
import { FaSearch } from 'react-icons/fa'

export default function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  right = null,
}) {
  return (
    <div className="filter-bar-premium">
      <div className="search-input-wrap flex-grow-1">
        <FaSearch />
        <input
          type="text"
          className="form-control-custom"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {filters.map((f) => (
        <select
          key={f.key || f.placeholder}
          className="form-select-custom"
          style={{ maxWidth: f.maxWidth || 200 }}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
        >
          <option value="">{f.placeholder}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
      {right && (
        <div className="d-flex gap-3 ms-auto" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {right}
        </div>
      )}
    </div>
  )
}
