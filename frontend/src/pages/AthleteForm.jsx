/**
 * Add / Edit athlete form with professional styling.
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { athletesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaSave, FaTimes, FaUserPlus } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '',
  date_of_birth: '', gender: 'Male', sport: '', team: '',
  height_cm: '', address: '', emergency_contact: '',
  emergency_phone: '', status: 'Active',
}

export default function AthleteForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (isEdit) {
      athletesAPI.getById(id).then(res => {
        const d = res.data
        setForm({ ...d, date_of_birth: d.date_of_birth || '', height_cm: d.height_cm || '' })
      }).catch(() => showToast('Failed to load athlete', 'error'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) await athletesAPI.update(id, form)
      else await athletesAPI.create(form)
      showToast(isEdit ? 'Athlete updated successfully' : 'Athlete added successfully')
      navigate('/dashboard/athletes')
    } catch { showToast('Failed to save athlete', 'error') }
    finally { setLoading(false) }
  }

  if (fetching) return <LoadingSpinner message="Loading athlete..." fullScreen />

  return (
    <div className="animate-in">
      <PageHeader
        title={isEdit ? 'Edit Athlete' : 'Add New Athlete'}
        subtitle={isEdit ? 'Update athlete profile information' : 'Register a new athlete in the system'}
      />

      <div className="card-panel">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {[
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
            ].map(([name, label, type, req]) => (
              <div className="col-md-6" key={name}>
                <label className="form-label-custom">{label}{req && ' *'}</label>
                <input type={type} name={name} className="form-control-custom"
                  value={form[name]} onChange={handleChange} required={req}
                  step={type === 'number' ? '0.1' : undefined} />
              </div>
            ))}
            <div className="col-md-6">
              <label className="form-label-custom">Gender</label>
              <select name="gender" className="form-select-custom" value={form.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label-custom">Status</label>
              <select name="status" className="form-select-custom" value={form.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Injured">Injured</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label-custom">Address</label>
              <textarea name="address" className="form-control-custom" rows="2"
                value={form.address} onChange={handleChange} />
            </div>
          </div>

          <div className="d-flex gap-3 mt-4">
            <button type="submit" className="btn-gold" disabled={loading}>
              <FaSave /> {loading ? 'Saving...' : (isEdit ? 'Update Athlete' : <><FaUserPlus /> Add Athlete</>)}
            </button>
            <button type="button" className="btn-outline-navy" onClick={() => navigate('/dashboard/athletes')}>
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}