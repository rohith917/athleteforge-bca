/**
 * Competition management — events, results, medal tracking.
 */
import { useState, useEffect } from 'react'
import { competitionsAPI, athletesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaTrash, FaTrophy, FaMedal } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

const emptyComp = { name: '', sport: '', venue: '', competition_date: new Date().toISOString().split('T')[0], level: 'Local', description: '' }
const emptyResult = { athlete: '', position: '', medal: 'None', score: '', notes: '' }

export default function Competitions() {
  const [competitions, setCompetitions] = useState([])
  const [athletes, setAthletes] = useState([])
  const [medals, setMedals] = useState(null)
  const [compForm, setCompForm] = useState(emptyComp)
  const [resultForm, setResultForm] = useState(emptyResult)
  const [selectedComp, setSelectedComp] = useState(null)
  const [showCompForm, setShowCompForm] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [compRes, athRes, medalRes] = await Promise.all([
        competitionsAPI.getAll(), athletesAPI.getAll(), competitionsAPI.getMedals(),
      ])
      setCompetitions(compRes.data.results || compRes.data)
      setAthletes(athRes.data.results || athRes.data)
      setMedals(medalRes.data)
    } catch { showToast('Failed to load competitions', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleCompSubmit = async (e) => {
    e.preventDefault()
    await competitionsAPI.create(compForm)
    showToast('Competition added'); setCompForm(emptyComp); setShowCompForm(false); fetchData()
  }

  const handleResultSubmit = async (e) => {
    e.preventDefault()
    await competitionsAPI.addResult(selectedComp, resultForm)
    showToast('Result saved'); setResultForm(emptyResult); setShowResultForm(false); fetchData()
  }

  const medalBadge = (medal) => {
    const map = { Gold: 'badge-gold-medal', Silver: 'badge-silver-medal', Bronze: 'badge-bronze-medal' }
    return medal !== 'None' ? <span className={`badge-pill ${map[medal]}`}>{medal}</span> : '—'
  }

  if (loading) return <LoadingSpinner message="Loading competitions..." fullScreen />

  return (
    <div className="animate-in">
      <PageHeader
        title="Competitions"
        subtitle="AthleteForge — Events, results & medal tracking"
        action={<button className="btn-gold" onClick={() => setShowCompForm(!showCompForm)}><FaPlus /> Add Competition</button>}
      />

      {medals && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3"><StatCard icon={FaMedal} value={medals.gold} label="Gold" variant="gold" /></div>
          <div className="col-6 col-md-3"><StatCard icon={FaMedal} value={medals.silver} label="Silver" variant="info" /></div>
          <div className="col-6 col-md-3"><StatCard icon={FaMedal} value={medals.bronze} label="Bronze" variant="primary" /></div>
          <div className="col-6 col-md-3"><StatCard icon={FaTrophy} value={medals.total} label="Total Medals" variant="success" /></div>
        </div>
      )}

      {showCompForm && (
        <div className="card-panel">
          <h5 className="card-panel-title"><FaTrophy /> New Competition</h5>
          <form onSubmit={handleCompSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-custom">Name *</label>
                <input className="form-control-custom" value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <label className="form-label-custom">Sport *</label>
                <input className="form-control-custom" value={compForm.sport}
                  onChange={(e) => setCompForm({ ...compForm, sport: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <label className="form-label-custom">Level</label>
                <select className="form-select-custom" value={compForm.level}
                  onChange={(e) => setCompForm({ ...compForm, level: e.target.value })}>
                  <option>Local</option><option>State</option><option>National</option><option>International</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Date *</label>
                <input type="date" className="form-control-custom" value={compForm.competition_date}
                  onChange={(e) => setCompForm({ ...compForm, competition_date: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Venue</label>
                <input className="form-control-custom" value={compForm.venue}
                  onChange={(e) => setCompForm({ ...compForm, venue: e.target.value })} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn-gold">Save</button>
              <button type="button" className="btn-outline-navy" onClick={() => setShowCompForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showResultForm && selectedComp && (
        <div className="card-panel">
          <h5 className="card-panel-title">Add Result</h5>
          <form onSubmit={handleResultSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label-custom">Athlete *</label>
                <select className="form-select-custom" value={resultForm.athlete}
                  onChange={(e) => setResultForm({ ...resultForm, athlete: e.target.value })} required>
                  <option value="">Select</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label-custom">Position</label>
                <input type="number" className="form-control-custom" value={resultForm.position}
                  onChange={(e) => setResultForm({ ...resultForm, position: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label-custom">Medal</label>
                <select className="form-select-custom" value={resultForm.medal}
                  onChange={(e) => setResultForm({ ...resultForm, medal: e.target.value })}>
                  <option value="None">None</option><option value="Gold">Gold</option>
                  <option value="Silver">Silver</option><option value="Bronze">Bronze</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Score</label>
                <input className="form-control-custom" value={resultForm.score}
                  onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn-gold">Save Result</button>
              <button type="button" className="btn-outline-navy" onClick={() => setShowResultForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {competitions.map(comp => (
        <div className="card-panel" key={comp.id}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h5 style={{ fontFamily: 'Playfair Display', color: 'var(--navy-800)' }}>{comp.name}</h5>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {comp.sport} · {comp.level} · {comp.competition_date} · {comp.venue}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn-navy" style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => { setSelectedComp(comp.id); setShowResultForm(true) }}>Add Result</button>
              <button className="btn-icon btn-icon-delete"
                onClick={async () => { if (confirm('Delete?')) { await competitionsAPI.delete(comp.id); showToast('Deleted'); fetchData() } }}>
                <FaTrash /></button>
            </div>
          </div>
          {comp.results?.length > 0 && (
            <table className="table-custom mt-3">
              <thead><tr><th>Athlete</th><th>Position</th><th>Medal</th><th>Score</th></tr></thead>
              <tbody>
                {comp.results.map(r => (
                  <tr key={r.id}>
                    <td>{r.athlete_name}</td><td>{r.position || '—'}</td>
                    <td>{medalBadge(r.medal)}</td><td>{r.score || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}