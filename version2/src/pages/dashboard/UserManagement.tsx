import { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { UserPlus, ShieldCheck, Ban, Check } from 'lucide-react'
import { adminAPI, athletesAPI } from '@/services/api'
import { parseListResponse, getLoadErrorMessage } from '@/lib/apiHelpers'
import { useToast } from '@/context/ToastContext'
import type { AdminUser, AthleteListItem, UserRole } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { SearchFilterBar } from '@/components/dashboard/SearchFilterBar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

const emptyForm = { email: '', password: '', first_name: '', last_name: '', role: 'coach' as UserRole, athlete_id: '' }

export default function UserManagement() {
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const [usersRes, athRes] = await Promise.all([adminAPI.getUsers(params), athletesAPI.getAll()])
      setUsers(parseListResponse(usersRes.data))
      setAthletes(parseListResponse(athRes.data))
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'users'))
      showToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [search, roleFilter])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.createUser({ ...form, athlete_id: form.athlete_id ? Number(form.athlete_id) : null })
      showToast('User created successfully', 'success')
      setForm(emptyForm)
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      const data = (err as AxiosError<{ email?: string[] }>).response?.data
      showToast(data?.email?.[0] || 'Failed to create user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (userId: number, data: Record<string, unknown>) => {
    try {
      await adminAPI.updateUser(userId, data)
      showToast('User updated', 'success')
      fetchUsers()
    } catch (err) {
      const errData = (err as AxiosError<{ error?: string }>).response?.data
      showToast(errData?.error || 'Update failed', 'error')
    }
  }

  const handleDeactivate = async (userId: number, name: string) => {
    if (!window.confirm(`Deactivate "${name}"? They will not be able to log in.`)) return
    try {
      await adminAPI.deactivateUser(userId)
      showToast('User deactivated', 'success')
      fetchUsers()
    } catch (err) {
      const errData = (err as AxiosError<{ error?: string }>).response?.data
      showToast(errData?.error || 'Failed to deactivate', 'error')
    }
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Control roles, access, and athlete account links"
        actions={<Button size="sm" magnetic={false} onClick={() => setShowForm((v) => !v)}><UserPlus size={16} /> Add User</Button>}
      />

      {loadError && (
        <Card className="mb-6 flex items-center justify-between p-4">
          <p className="font-body text-sm text-accent-hover">{loadError}</p>
          <button onClick={fetchUsers} className="font-body text-xs font-semibold uppercase text-accent hover:text-accent-hover">Retry</button>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6 p-6">
          <h3 className="mb-4 font-display text-base font-bold text-text">Create New User</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="um_first" label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
              <Input id="um_last" label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              <Input id="um_email" type="email" label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input id="um_password" type="password" label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                <option value="coach">Coach</option>
                <option value="student">Student</option>
              </Select>
              {form.role === 'student' && (
                <Select label="Link to Athlete" value={form.athlete_id} onChange={(e) => setForm({ ...form, athlete_id: e.target.value })}>
                  <option value="">Auto-link by email (if match)</option>
                  {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name} — {a.sport}</option>)}
                </Select>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" size="sm" magnetic={false} disabled={saving}>{saving ? 'Creating...' : 'Create User'}</Button>
              <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        filters={[{
          key: 'role',
          value: roleFilter,
          onChange: setRoleFilter,
          placeholder: 'All Roles',
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'coach', label: 'Coach' },
            { value: 'student', label: 'Student' },
          ],
        }]}
      />

      <Card>
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <ShieldCheck size={16} className="text-accent" />
          <h3 className="font-body text-sm font-semibold text-text">All Users ({users.length})</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={26} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['User', 'Email', 'Role', 'Linked Athlete', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-left font-body text-[11px] font-semibold uppercase tracking-widest text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={`${u.first_name} ${u.last_name}`} size="sm" />
                        <div>
                          <strong className="block font-body text-sm text-text">{u.first_name} {u.last_name}</strong>
                          <small className="font-body text-xs text-text-muted">@{u.username}</small>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-text-secondary">{u.email}</td>
                    <td className="px-5 py-3">
                      {u.is_superuser ? (
                        <Badge variant="accent">admin</Badge>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdate(u.id, { role: e.target.value })}
                          className="rounded-lg border border-border bg-background px-2 py-1.5 font-body text-xs text-text outline-none focus:border-accent"
                        >
                          <option value="admin">Admin</option>
                          <option value="coach">Coach</option>
                          <option value="student">Student</option>
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {u.role === 'student' && !u.is_superuser ? (
                        <select
                          value={u.athlete_id ?? ''}
                          onChange={(e) => handleUpdate(u.id, { athlete_id: e.target.value ? Number(e.target.value) : null })}
                          className="rounded-lg border border-border bg-background px-2 py-1.5 font-body text-xs text-text outline-none focus:border-accent"
                        >
                          <option value="">Not linked</option>
                          {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                        </select>
                      ) : (
                        <span className="font-body text-sm text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={u.is_active ? 'success' : 'default'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      {u.is_active ? (
                        !u.is_superuser && (
                          <button onClick={() => handleDeactivate(u.id, u.first_name)} title="Deactivate" className="flex size-8 items-center justify-center rounded-lg border border-border-strong text-text-muted hover:text-accent-hover">
                            <Ban size={14} />
                          </button>
                        )
                      ) : (
                        <button onClick={() => handleUpdate(u.id, { is_active: true })} title="Reactivate" className="flex size-8 items-center justify-center rounded-lg border border-border-strong text-text-muted hover:text-emerald-400">
                          <Check size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
