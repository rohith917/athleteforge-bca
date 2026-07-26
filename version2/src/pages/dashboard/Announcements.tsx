import { useState, useEffect, type FormEvent } from 'react'
import { Megaphone, Plus, X, Pin, Trash2 } from 'lucide-react'
import type { AxiosError } from 'axios'
import { announcementsAPI } from '@/services/api'
import { parseListResponse, getLoadErrorMessage } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { Announcement, AnnouncementAudience } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'

const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = { all: 'Everyone', students: 'Students', coaches: 'Coaches', team: 'Team' }
const emptyForm = { title: '', message: '', audience: 'all' as AnnouncementAudience, team_filter: '', pinned: false }

export default function Announcements() {
  const { isStaff } = useAuth()
  const { showToast } = useToast()
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await announcementsAPI.getAll()
      setItems(parseListResponse(res.data))
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'announcements'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.message) return
    setSaving(true)
    try {
      await announcementsAPI.create(form)
      showToast('Announcement posted', 'success')
      setForm(emptyForm)
      setShowForm(false)
      fetchData()
    } catch (err) {
      const data = (err as AxiosError<{ error?: string }>).response?.data
      showToast(data?.error || 'Could not post announcement', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await announcementsAPI.delete(id)
      setItems((prev) => prev.filter((a) => a.id !== id))
    } catch {
      showToast('Could not delete announcement', 'error')
    }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Team-wide updates from your coaches and admins"
        actions={isStaff ? (
          <Button size="sm" magnetic={false} onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Cancel' : 'New Announcement'}
          </Button>
        ) : undefined}
      />

      {showForm && (
        <Card className="mb-6 p-6">
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Input id="ann_title" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <Select label="Audience" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as AnnouncementAudience })}>
                <option value="all">Everyone</option>
                <option value="students">Students</option>
                <option value="coaches">Coaches</option>
                <option value="team">Specific Team</option>
              </Select>
              {form.audience === 'team' && (
                <div className="sm:col-span-3">
                  <Input id="ann_team" label="Team name" placeholder="e.g. Team Alpha" value={form.team_filter} onChange={(e) => setForm({ ...form, team_filter: e.target.value })} />
                </div>
              )}
              <div className="sm:col-span-3">
                <Textarea id="ann_message" label="Message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <label className="flex items-center gap-2 font-body text-sm text-text-secondary">
                <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="size-4 accent-accent" />
                Pin to top
              </label>
              <Button type="submit" size="sm" magnetic={false} disabled={saving}>{saving ? 'Posting...' : 'Post'}</Button>
            </div>
          </form>
        </Card>
      )}

      {loadError && (
        <Card className="mb-6 flex items-center justify-between p-4">
          <p className="font-body text-sm text-accent-hover">{loadError}</p>
          <button onClick={fetchData} className="font-body text-xs font-semibold uppercase text-accent hover:text-accent-hover">Retry</button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : items.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="No announcements yet" /></Card>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {a.pinned && <Pin size={14} className="text-amber-400" />}
                  <h3 className="font-body text-sm font-semibold text-text">{a.title}</h3>
                  <Badge variant="accent">{AUDIENCE_LABEL[a.audience] || a.audience}</Badge>
                </div>
                {isStaff && (
                  <button onClick={() => handleDelete(a.id)} className="text-text-muted hover:text-accent-hover">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="mt-2 font-body text-sm text-text-secondary">{a.message}</p>
              <p className="mt-2 font-body text-xs text-text-muted">{a.created_by_name} · {new Date(a.created_at).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
