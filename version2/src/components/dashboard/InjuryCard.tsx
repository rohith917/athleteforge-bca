import { Trash2 } from 'lucide-react'
import type { Injury, RecoveryStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'

const SEVERITY_VARIANT = { Minor: 'warning', Moderate: 'warning', Severe: 'danger' } as const
const RECOVERY_OPTIONS: RecoveryStatus[] = ['Recovering', 'Ongoing Treatment', 'Recovered']

export function InjuryCard({
  injury, isStaff, onRecoveryUpdate, onDelete,
}: {
  injury: Injury
  isStaff: boolean
  onRecoveryUpdate: (id: number, status: string) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-body text-sm font-semibold text-text">{injury.athlete_name}</p>
          <p className="mt-0.5 font-body text-xs text-text-muted">{injury.injury_type} · {injury.body_part}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={SEVERITY_VARIANT[injury.severity]}>{injury.severity}</Badge>
          {isStaff && (
            <button onClick={() => onDelete(injury.id)} className="text-text-muted hover:text-accent-hover">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 font-body text-xs text-text-secondary">Injured {injury.injury_date}</p>
      {injury.expected_recovery_date && (
        <p className="mt-1 font-body text-xs text-text-muted">Expected return: {injury.expected_recovery_date}</p>
      )}
      {injury.medical_notes && <p className="mt-2 font-body text-xs text-text-secondary">{injury.medical_notes}</p>}

      <div className="mt-4 border-t border-border pt-3">
        {isStaff ? (
          <select
            value={injury.recovery_status}
            onChange={(e) => onRecoveryUpdate(injury.id, e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-xs text-text outline-none focus:border-accent"
          >
            {RECOVERY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <Badge variant={injury.recovery_status === 'Recovered' ? 'success' : 'accent'}>{injury.recovery_status}</Badge>
        )}
      </div>
    </div>
  )
}
