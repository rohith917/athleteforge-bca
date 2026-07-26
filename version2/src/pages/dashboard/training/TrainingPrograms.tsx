import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, Plus, Calendar, Layers, Wand2 } from 'lucide-react'
import { trainingAPI, athletesAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { TrainingProgramListItem, AthleteListItem, ProgramStatus } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'

const STATUS_VARIANT = { draft: 'default', active: 'accent', completed: 'success', archived: 'default' } as const
const emptyForm = { name: '', athlete: '', sport: '', start_date: '', end_date: '' }

export default function TrainingPrograms() {
  const { isStaff } = useAuth()
  const { showToast } = useToast()
  const [programs, setPrograms] = useState<TrainingProgramListItem[]>([])
  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      trainingAPI.getPrograms(),
      isStaff ? athletesAPI.getAll() : Promise.resolve({ data: [] as AthleteListItem[] }),
    ])
      .then(([progRes, athRes]) => {
        setPrograms(parseListResponse(progRes.data))
        setAthletes(parseListResponse(athRes.data))
      })
      .catch(() => showToast('Failed to load training programs', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await trainingAPI.createProgram({
        name: form.name,
        athlete: Number(form.athlete),
        sport: form.sport || undefined,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      })
      showToast('Program created', 'success')
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch {
      showToast('Failed to create program', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={isStaff ? 'Training Programs' : 'My Training Programs'}
        description={isStaff ? 'Build and assign day-by-day training programs' : 'Programs your coach has assigned to you'}
        actions={isStaff ? (
          <>
            <Link to="/dashboard/training/generate">
              <Button size="sm" variant="outline" magnetic={false}><Wand2 size={16} /> Generate Program</Button>
            </Link>
            <Button size="sm" magnetic={false} onClick={() => setShowForm((v) => !v)}><Plus size={16} /> New Program</Button>
          </>
        ) : undefined}
      />

      {showForm && (
        <Card className="mb-6 p-6">
          <h3 className="mb-4 font-display text-base font-bold text-text">New Training Program</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="prog_name" label="Program Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Select label="Athlete *" value={form.athlete} onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                <option value="">Select athlete</option>
                {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </Select>
              <Input id="prog_sport" label="Sport" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} />
              <Input id="prog_start" type="date" label="Start Date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              <Input id="prog_end" type="date" label="End Date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" size="sm" magnetic={false} disabled={saving}>{saving ? 'Creating...' : 'Create Program'}</Button>
              <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : programs.length === 0 ? (
        <Card><EmptyState icon={Dumbbell} title="No training programs yet" /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Link key={p.id} to={`/dashboard/training/${p.id}`}>
              <Card className="flex h-full flex-col p-6 transition-colors hover:border-border-strong">
                <div className="flex items-center justify-between">
                  <Badge variant={STATUS_VARIANT[p.status as ProgramStatus]}>{p.status}</Badge>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-text">{p.name}</h3>
                <p className="mt-1 font-body text-xs text-text-secondary">{p.athlete_name}{p.sport ? ` · ${p.sport}` : ''}</p>
                <div className="mt-4 flex flex-1 items-end gap-4 border-t border-border pt-4 font-body text-[11px] text-text-muted">
                  <span className="flex items-center gap-1.5"><Layers size={12} /> {p.day_count} days</span>
                  {p.start_date && <span className="flex items-center gap-1.5"><Calendar size={12} /> {p.start_date}</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
