import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, UserPlus } from 'lucide-react'
import { athletesAPI } from '@/services/api'
import { useToast } from '@/context/ToastContext'
import type { Athlete, Gender, AthleteStatus } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { FullScreenLoader } from '@/components/ui/Spinner'

type FormState = {
  first_name: string; last_name: string; email: string; phone: string
  date_of_birth: string; gender: Gender; sport: string; team: string
  height_cm: string; address: string; emergency_contact: string
  emergency_phone: string; status: AthleteStatus
}

const emptyForm: FormState = {
  first_name: '', last_name: '', email: '', phone: '',
  date_of_birth: '', gender: 'Male', sport: '', team: '',
  height_cm: '', address: '', emergency_contact: '',
  emergency_phone: '', status: 'Active',
}

const FIELDS: Array<[keyof FormState, string, string, boolean]> = [
  ['first_name', 'First Name', 'text', true],
  ['last_name', 'Last Name', 'text', true],
  ['email', 'Email', 'email', false],
  ['phone', 'Phone', 'text', false],
  ['date_of_birth', 'Date of Birth', 'date', true],
  ['height_cm', 'Height (cm)', 'number', false],
  ['sport', 'Sport', 'text', true],
  ['team', 'Team', 'text', false],
  ['emergency_contact', 'Emergency Contact', 'text', false],
  ['emergency_phone', 'Emergency Phone', 'text', false],
]

export default function AthleteForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (isEdit && id) {
      athletesAPI.getById(Number(id))
        .then((res) => {
          const d = res.data as Athlete
          setForm({
            first_name: d.first_name, last_name: d.last_name, email: d.email || '',
            phone: d.phone || '', date_of_birth: d.date_of_birth || '', gender: d.gender,
            sport: d.sport, team: d.team || '', height_cm: d.height_cm != null ? String(d.height_cm) : '',
            address: d.address || '', emergency_contact: d.emergency_contact || '',
            emergency_phone: d.emergency_phone || '', status: d.status,
          })
        })
        .catch(() => showToast('Failed to load athlete', 'error'))
        .finally(() => setFetching(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit])

  const handleChange = (name: keyof FormState, value: string) => setForm((f) => ({ ...f, [name]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Partial<Athlete> = {
        ...form,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
      }
      if (isEdit && id) await athletesAPI.update(Number(id), payload)
      else await athletesAPI.create(payload)
      showToast(isEdit ? 'Athlete updated successfully' : 'Athlete added successfully', 'success')
      navigate('/dashboard/athletes')
    } catch {
      showToast('Failed to save athlete', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <FullScreenLoader message="Loading athlete..." />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Athlete' : 'Add New Athlete'}
        description={isEdit ? 'Update athlete profile information' : 'Register a new athlete in the system'}
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FIELDS.map(([name, label, type, required]) => (
              <Input
                key={name}
                id={name}
                label={`${label}${required ? ' *' : ''}`}
                type={type}
                value={form[name] as string}
                onChange={(e) => handleChange(name, e.target.value)}
                required={required}
                step={type === 'number' ? '0.1' : undefined}
              />
            ))}

            <Select label="Gender" value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>

            <Select label="Status" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
              <option value="Active">Active</option>
              <option value="Injured">Injured</option>
              <option value="Inactive">Inactive</option>
            </Select>

            <div className="sm:col-span-2">
              <Textarea
                id="address"
                label="Address"
                rows={2}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={loading} magnetic={false}>
              <Save size={16} /> {loading ? 'Saving...' : isEdit ? 'Update Athlete' : <><UserPlus size={16} /> Add Athlete</>}
            </Button>
            <Button type="button" variant="outline" magnetic={false} onClick={() => navigate('/dashboard/athletes')}>
              <X size={16} /> Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
