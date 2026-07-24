import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { Line } from 'react-chartjs-2'
import { Plus, Calculator, Trash2, Scale } from 'lucide-react'
import '@/lib/chartSetup'
import { axisChartOptions, CHART_PALETTE } from '@/lib/chartSetup'
import { weightAPI, athletesAPI } from '@/services/api'
import { parseListResponse, getLoadErrorMessage } from '@/lib/apiHelpers'
import { useToast } from '@/context/ToastContext'
import type { WeightTracking as WeightRecord, AthleteListItem, BMIResult } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Badge } from '@/components/ui/Badge'

const emptyForm = {
  athlete: '', record_date: new Date().toISOString().split('T')[0],
  weight_kg: '', height_cm: '', body_fat_percentage: '',
}

const BMI_VARIANT = { Underweight: 'default', Normal: 'success', Overweight: 'warning', Obese: 'danger' } as const

export default function WeightTracking() {
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null)
  const [bmiInput, setBmiInput] = useState({ weight_kg: '', height_cm: '' })
  const [filterAthlete, setFilterAthlete] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { showToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params = filterAthlete ? { athlete_id: filterAthlete } : {}
      const [wRes, aRes] = await Promise.all([weightAPI.getAll(params), athletesAPI.getAll()])
      setRecords(parseListResponse(wRes.data))
      setAthletes(parseListResponse(aRes.data))
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'weight records'))
      showToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [filterAthlete])

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime()),
    [records],
  )

  const weightChart = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime())
    return {
      labels: sorted.map((r) => r.record_date),
      datasets: [{ data: sorted.map((r) => r.weight_kg), borderColor: CHART_PALETTE[0], backgroundColor: 'rgba(177,18,38,0.12)', fill: true, tension: 0.4, pointRadius: 0 }],
    }
  }, [records])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await weightAPI.create({
        athlete: Number(form.athlete),
        record_date: form.record_date,
        weight_kg: Number(form.weight_kg),
        height_cm: Number(form.height_cm),
        body_fat_percentage: form.body_fat_percentage ? Number(form.body_fat_percentage) : null,
      })
      showToast('Weight record saved', 'success')
      setForm(emptyForm)
      setShowForm(false)
      fetchData()
    } catch {
      showToast('Failed to save', 'error')
    }
  }

  const calculateBMI = async () => {
    try {
      const res = await weightAPI.calculateBMI({ weight_kg: Number(bmiInput.weight_kg), height_cm: Number(bmiInput.height_cm) })
      setBmiResult(res.data as BMIResult)
    } catch {
      showToast('Enter valid weight and height', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this record?')) return
    await weightAPI.delete(id)
    showToast('Deleted', 'success')
    fetchData()
  }

  const latest = sortedRecords[0]

  return (
    <div>
      <PageHeader
        title="Weight Management"
        description="Body composition · BMI · Weight trends"
        actions={<Button size="sm" magnetic={false} onClick={() => setShowForm((v) => !v)}><Plus size={16} /> Add Record</Button>}
      />

      {loadError && (
        <Card className="mb-6 flex items-center justify-between p-4">
          <p className="font-body text-sm text-accent-hover">{loadError}</p>
          <button onClick={fetchData} className="font-body text-xs font-semibold uppercase text-accent hover:text-accent-hover">Retry</button>
        </Card>
      )}

      <div className="mb-6 max-w-xs">
        <Select label="Athlete" value={filterAthlete} onChange={(e) => setFilterAthlete(e.target.value)}>
          <option value="">All Athletes</option>
          {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Scale} label="Latest Weight" value={latest?.weight_kg || 0} suffix=" kg" accent />
        <StatCard icon={Calculator} label="BMI" value={latest?.bmi || 0} decimals={1} />
        <StatCard icon={Scale} label="Body Fat" value={latest?.body_fat_percentage || 0} suffix="%" />
        <StatCard icon={Scale} label="Records" value={records.length} />
      </div>

      {showForm && (
        <Card className="mt-6 p-6">
          <h3 className="mb-4 font-display text-base font-bold text-text">New Weight Record</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select label="Athlete *" value={form.athlete} onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                <option value="">Select</option>
                {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </Select>
              <Input id="wt_date" type="date" label="Date *" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} required />
              <Input id="wt_weight" type="number" step="0.1" label="Weight (kg) *" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} required />
              <Input id="wt_height" type="number" step="0.1" label="Height (cm) *" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} required />
              <Input id="wt_fat" type="number" step="0.1" label="Body Fat %" value={form.body_fat_percentage} onChange={(e) => setForm({ ...form, body_fat_percentage: e.target.value })} />
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" size="sm" magnetic={false}>Save</Button>
              <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>BMI Calculator</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Input id="bmi_weight" type="number" step="0.1" label="Weight (kg)" value={bmiInput.weight_kg} onChange={(e) => setBmiInput({ ...bmiInput, weight_kg: e.target.value })} />
              <Input id="bmi_height" type="number" step="0.1" label="Height (cm)" value={bmiInput.height_cm} onChange={(e) => setBmiInput({ ...bmiInput, height_cm: e.target.value })} />
            </div>
            <Button className="mt-4 w-full" magnetic={false} onClick={calculateBMI}><Calculator size={16} /> Calculate BMI</Button>
            {bmiResult && (
              <div className="mt-4 rounded-xl border border-border bg-white/5 p-4 text-center">
                <div className="font-display text-3xl font-extrabold text-text">{bmiResult.bmi}</div>
                <Badge variant={BMI_VARIANT[bmiResult.category]} className="mt-2">{bmiResult.category}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Weight Trend</CardTitle></CardHeader>
          <CardContent style={{ height: 260 }}>
            {records.length > 0 ? <Line data={weightChart} options={axisChartOptions} /> : <EmptyState icon={Scale} title="No weight data yet" />}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Weight History</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size={24} /></div>
          ) : records.length === 0 ? (
            <EmptyState icon={Scale} title="No weight records yet" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sortedRecords.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between">
                    <div className="font-display text-lg font-extrabold text-text">{r.weight_kg} kg</div>
                    <button onClick={() => handleDelete(r.id)} className="text-text-muted hover:text-accent-hover"><Trash2 size={14} /></button>
                  </div>
                  <p className="mt-1 font-body text-xs text-text-muted">{r.record_date}</p>
                  <p className="font-body text-xs text-text-secondary">{r.athlete_name}</p>
                  {r.bmi && <Badge variant={BMI_VARIANT[r.bmi_category as keyof typeof BMI_VARIANT] || 'default'} className="mt-2">{r.bmi} · {r.bmi_category}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
