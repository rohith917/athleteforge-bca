/**
 * Admin User Management — create users, change roles, link athletes, deactivate.
 */
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminAPI, athletesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import {
  FaUserPlus, FaSearch, FaUserShield, FaBan, FaCheck, FaTrash
} from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import Avatar from '../components/Avatar'

const emptyForm = {
  email: '', password: '', first_name: '', last_name: '', role: 'coach', athlete_id: '',
}

export default function UserManagement() {
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [athletes, setAthletes] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const res = await adminAPI.getUsers(params)
      setUsers(res.data)
    } catch {
      showToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    athletesAPI.getAll().then(res => setAthletes(res.data.results || res.data)).catch(() => {})
  }, [search, roleFilter])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, athlete_id: form.athlete_id ? parseInt(form.athlete_id) : null }
      await adminAPI.createUser(payload)
      showToast('User created successfully')
      setForm(emptyForm)
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      showToast(err.response?.data?.email?.[0] || 'Failed to create user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (userId, data) => {
    try {
      await adminAPI.updateUser(userId, data)
      showToast('User updated')
      fetchUsers()
    } catch (err) {
      showToast(err.response?.data?.error || 'Update failed', 'error')
    }
  }

  const handleDeactivate = async (userId, name) => {
    if (!window.confirm(`Deactivate "${name}"? They will not be able to log in.`)) return
    try {
      await adminAPI.deactivateUser(userId)
      showToast('User deactivated')
      fetchUsers()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to deactivate', 'error')
    }
  }

  const handleReactivate = async (userId) => {
    await handleUpdate(userId, { is_active: true })
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="User Management"
        subtitle="Control roles, access, and athlete account links"
        action={
          <button className="btn-gold" onClick={() => setShowForm(!showForm)}>
            <FaUserPlus /> Add User
          </button>
        }
      />

      {showForm && (
        <div className="card-panel mb-4">
          <h5 className="card-panel-title"><FaUserPlus /> Create New User</h5>
          <form onSubmit={handleCreate}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-custom">First Name</label>
                <input className="form-control-custom" value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Last Name</label>
                <input className="form-control-custom" value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Email</label>
                <input type="email" className="form-control-custom" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Password</label>
                <input type="password" className="form-control-custom" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Role</label>
                <select className="form-select-custom" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="coach">Coach</option>
                  <option value="student">Student</option>
                </select>
              </div>
              {form.role === 'student' && (
                <div className="col-md-8">
                  <label className="form-label-custom">Link to Athlete</label>
                  <select className="form-select-custom" value={form.athlete_id}
                    onChange={e => setForm({ ...form, athlete_id: e.target.value })}>
                    <option value="">Auto-link by email (if match)</option>
                    {athletes.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.full_name || `${a.first_name} ${a.last_name}`} — {a.sport}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn-gold" disabled={saving}>
                {saving ? 'Creating...' : 'Create User'}
              </button>
              <button type="button" className="btn-outline-navy" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="search-bar">
        <div className="search-input-wrap">
          <FaSearch />
          <input type="text" className="form-control-custom" placeholder="Search users..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select-custom" style={{ maxWidth: 180 }}
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="coach">Coach</option>
          <option value="student">Student</option>
        </select>
      </div>

      <div className="card-panel">
        <h5 className="card-panel-title"><FaUserShield /> All Users ({users.length})</h5>
        {loading ? <LoadingSpinner /> : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>User</th><th>Email</th><th>Role</th><th>Linked Athlete</th>
                  <th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={`${u.first_name} ${u.last_name}`} size="sm" />
                        <div>
                          <strong>{u.first_name} {u.last_name}</strong>
                          <br /><small style={{ color: 'var(--text-muted)' }}>@{u.username}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td>
                      {u.is_superuser ? (
                        <span className="role-badge role-admin">admin</span>
                      ) : (
                        <select className="form-select-custom" style={{ maxWidth: 120, padding: '4px 8px', fontSize: '0.8rem' }}
                          value={u.role} disabled={u.is_superuser}
                          onChange={e => handleUpdate(u.id, { role: e.target.value })}>
                          <option value="admin">Admin</option>
                          <option value="coach">Coach</option>
                          <option value="student">Student</option>
                        </select>
                      )}
                    </td>
                    <td>
                      {u.role === 'student' && !u.is_superuser ? (
                        <select className="form-select-custom" style={{ maxWidth: 180, padding: '4px 8px', fontSize: '0.8rem' }}
                          value={u.athlete_id || ''}
                          onChange={e => handleUpdate(u.id, { athlete_id: e.target.value ? parseInt(e.target.value) : null })}>
                          <option value="">Not linked</option>
                          {athletes.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.full_name || `${a.first_name} ${a.last_name}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-pill ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {u.is_active ? (
                          !u.is_superuser && (
                            <button className="btn-icon btn-icon-delete" title="Deactivate"
                              onClick={() => handleDeactivate(u.id, u.first_name)}>
                              <FaBan />
                            </button>
                          )
                        ) : (
                          <button className="btn-icon btn-icon-view" title="Reactivate"
                            onClick={() => handleReactivate(u.id)}>
                            <FaCheck />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}