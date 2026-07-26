import { Link } from 'react-router-dom'
import { Trash2, Pencil } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { AthleteListItem } from '@/types'

const STATUS_VARIANT = { Active: 'success', Injured: 'danger', Inactive: 'default' } as const

export function AthleteCard({
  athlete, isStaff, onDelete,
}: {
  athlete: AthleteListItem
  isStaff: boolean
  onDelete: (id: number, name: string) => void
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-border-strong">
      <Link to={`/dashboard/athletes/${athlete.id}`} className="flex items-center gap-4">
        <Avatar src={athlete.avatar_url} name={athlete.full_name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold text-text">{athlete.full_name}</p>
          <p className="truncate font-body text-xs text-text-muted">{athlete.sport}{athlete.team ? ` · ${athlete.team}` : ''}</p>
          <Badge variant={STATUS_VARIANT[athlete.status]} className="mt-2">{athlete.status}</Badge>
        </div>
      </Link>

      {isStaff && (
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <Link
            to={`/dashboard/athletes/${athlete.id}/edit`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-strong py-2 font-body text-xs font-semibold text-text-secondary hover:text-text"
          >
            <Pencil size={13} /> Edit
          </Link>
          <button
            onClick={() => onDelete(athlete.id, athlete.full_name)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-strong py-2 font-body text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent-hover"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
