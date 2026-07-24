import { useState, useEffect, type FormEvent } from 'react'
import { Plus, HeartPulse } from 'lucide-react'
import { injuriesAPI, athletesAPI } from '@/services/api'
import { parseListResponse, getLoadErrorMessage } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { Injury, AthleteListItem, InjurySeverity } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { SearchFilterBar } from '@/components/dashboard/SearchFilterBar'
import { InjuryCard } from '@/components/dashboard/InjuryCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'

const BODY_PARTS = ['Head', 'Shoulder', 'Elbow', 'Wrist', 'Back', 'Hip', 'Knee', 'Ankle', 'Foot']

const emptyForm = {
  athlete: '', injury_type: '', body_part: '', injury_date: new Date().toISOString().split('T')[0],
  severity: 'Minor' as InjurySeverity, expected_recovery_date: '', medical_notes: '',
}

export default function Injuries() {
  const [injuries, setInjuries] = useState<Injury[]>([])
  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { isStaff, isStudent } = useAuth()
  const { showToast } = useToast()
  const debouncedSearch = useDebouncedValue(search)

  const fetchData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params: Record<string, string> = {}
      if (filter) params.recovery_status = filter
      if (debouncedSearch) params.search = debouncedSearch
      const [injRes, athRes] = await Promise.all([injuriesAPI.getAll(params), athletesAPI.getAll()])
      setInjuries(parseListResponse(injRes.data))
      setAthletes(parseListResponse(athRes.data))
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'injuries'))
      showToast('Failed to load injuries', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [filter, debouncedSearch])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await injuriesAPI.create({ ...form, athlete: Number(form.athlete) })
      showToast('Injury recorded successfully', 'success')
      setForm(emptyForm)
      setShowForm(false)
      fetchData()
    } catch {
      showToast('Failed to add injury', 'error')
    }
  }

  const handleRecoveryUpdate = async (id: number, status: string) => {
    try {
      await injuriesAPI.updateRecovery(id, status)
      showToast('Recovery status updated', 'success')
      fetchData()
    } catch {
      showToast('Update failed', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this injury record?')) return
    await injuriesAPI.delete(id)
    showToast('Deleted', 'success')
    fetchData()
  }

  const active = injuries.filter((i) => i.recovery_status !== 'Recovered').length
  const severe = injuries.filter((i) => i.severity === 'Severe').length
  const recovered = injuries.filter((i) => i.recovery_status === 'Recovered').length

  return (
    <div>
      <PageHeader
        title={isStudent ? 'My Injuries' : 'Injury Management'}
        description={isStudent ? 'Your injury history and recovery progress' : 'Track injuries · Recovery timelines · Return-to-play'}
        actions={isStaff ? (
          <Button size="sm" magnetic={false} onClick={() => setShowForm((v) => !v)}><Plus size={16} /> Report Injury</Button>
        ) : undefined}
      />

      {loadError && (
        <Card className="mb-6 flex items-center justify-between p-4">
          <p className="font-body text-sm text-accent-hover">{loadError}</p>
          <button onClick={fetchData} className="font-body text-xs font-semibold uppercase text-accent hover:text-accent-hover">Retry</button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={HeartPulse} label="Total Injuries" value={injuries.length} accent />
        <StatCard icon={HeartPulse} label="Active Cases" value={active} />
        <StatCard icon={HeartPulse} label="Severe" value={severe} />
        <StatCard icon={HeartPulse} label="Recovered" value={recovered} />
      </div>

      {isStaff && showForm && (
        <Card className="mt-6 p-6">
          <h3 className="mb-4 font-display text-base font-bold text-text">Record New Injury</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select label="Athlete *" value={form.athlete} onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                <option value="">Select</option>
                {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </Select>
              <Input id="injury_type" label="Injury Type *" value={form.injury_type} onChange={(e) => setForm({ ...form, injury_type: e.target.value })} required placeholder="e.g. Sprain, Fracture" />
              <Select label="Body Part *" value={form.body_part} onChange={(e) => setForm({ ...form, body_part: e.target.value })} required>
                <option value="">Select</option>
                {BODY_PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
              <Input id="injury_date" type="date" label="Date *" value={form.injury_date} onChange={(e) => setForm({ ...form, injury_date: e.target.value })} required />
              <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as InjurySeverity })}>
                <option>Minor</option><option>Moderate</option><option>Severe</option>
              </Select>
              <Input id="expected_recovery_date" type="date" label="Expected Return" value={form.expected_recovery_date} onChange={(e) => setForm({ ...form, expected_recovery_date: e.target.value })} />
              <div className="sm:col-span-3">
                <Textarea id="medical_notes" label="Medical Notes" rows={2} value={form.medical_notes} onChange={(e) => setForm({ ...form, medical_notes: e.target.value })} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" size="sm" magnetic={false}>Save Injury</Button>
              <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6">
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search injuries..."
          filters={[{
            key: 'recovery_status',
            value: filter,
            onChange: setFilter,
            placeholder: 'All Status',
            options: [
              { value: 'Recovering', label: 'Recovering' },
              { value: 'Ongoing Treatment', label: 'Ongoing Treatment' },
              { value: 'Recovered', label: 'Recovered' },
            ],
          }]}
        />

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={26} /></div>
        ) : injuries.length === 0 ? (
          <Card><EmptyState icon={HeartPulse} title="No injury records" /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {injuries.map((inj) => (
              <InjuryCard key={inj.id} injury={inj} isStaff={isStaff} onRecoveryUpdate={handleRecoveryUpdate} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
