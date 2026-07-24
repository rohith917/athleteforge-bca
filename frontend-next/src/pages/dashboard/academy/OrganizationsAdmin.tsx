import { useEffect, useState, type FormEvent } from 'react'
import { Building2, Plus, ShieldCheck, Users2 } from 'lucide-react'
import { academyAPI, adminAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { useToast } from '@/context/ToastContext'
import type { Organization, OrgRole, OrganizationMembership, AdminUser, OrgType } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { cn } from '@/lib/utils'

const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: 'academy', label: 'Academy' },
  { value: 'club', label: 'Club' },
  { value: 'university', label: 'University' },
  { value: 'federation', label: 'Federation' },
  { value: 'independent', label: 'Independent Coach' },
]

const emptyOrgForm = { name: '', org_type: 'academy' as OrgType }
const emptyMemberForm = { user: '', role: '' }

export default function OrganizationsAdmin() {
  const { showToast } = useToast()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [roles, setRoles] = useState<OrgRole[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [showOrgForm, setShowOrgForm] = useState(false)
  const [orgForm, setOrgForm] = useState(emptyOrgForm)
  const [memberForm, setMemberForm] = useState(emptyMemberForm)

  const loadOrgs = async () => {
    try {
      const [orgRes, roleRes, userRes] = await Promise.all([
        academyAPI.getOrganizations(),
        academyAPI.getRoles(),
        adminAPI.getUsers(),
      ])
      const orgList = parseListResponse(orgRes.data)
      setOrgs(orgList)
      setRoles(parseListResponse(roleRes.data))
      setUsers(parseListResponse(userRes.data))
      if (orgList.length && !selectedOrg) setSelectedOrg(orgList[0])
    } catch {
      showToast('Failed to load organizations', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrgs() }, [])

  useEffect(() => {
    if (!selectedOrg) return
    academyAPI.getMemberships({ organization: selectedOrg.id })
      .then((res) => setMemberships(parseListResponse(res.data)))
      .catch(() => setMemberships([]))
  }, [selectedOrg])

  const systemRoles = roles.filter((r) => r.is_system)
  const orgRoles = roles.filter((r) => !r.is_system && r.organization === selectedOrg?.id)

  const handleCreateOrg = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const res = await academyAPI.createOrganization(orgForm)
      showToast('Organization created', 'success')
      setOrgForm(emptyOrgForm)
      setShowOrgForm(false)
      await loadOrgs()
      setSelectedOrg(res.data)
    } catch {
      showToast('Failed to create organization', 'error')
    }
  }

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedOrg || !memberForm.user || !memberForm.role) return
    try {
      const res = await academyAPI.createMembership({
        user: Number(memberForm.user),
        organization: selectedOrg.id,
        role: Number(memberForm.role),
      })
      setMemberships((prev) => [res.data, ...prev])
      setMemberForm(emptyMemberForm)
      showToast('Member added', 'success')
    } catch {
      showToast('Failed to add member — they may already belong to this organization', 'error')
    }
  }

  const handleRemoveMember = async (id: number) => {
    if (!window.confirm('Remove this member from the organization?')) return
    try {
      await academyAPI.deleteMembership(id)
      setMemberships((prev) => prev.filter((m) => m.id !== id))
      showToast('Member removed', 'success')
    } catch {
      showToast('Failed to remove member', 'error')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>

  return (
    <div>
      <PageHeader
        title="Organizations & Roles"
        description="Manage academies, clubs, and federations, and who belongs to each with what role"
        actions={<Button size="sm" magnetic={false} onClick={() => setShowOrgForm((v) => !v)}><Plus size={16} /> New Organization</Button>}
      />

      {showOrgForm && (
        <Card className="mb-6 p-6">
          <h3 className="mb-4 font-display text-base font-bold text-text">New Organization</h3>
          <form onSubmit={handleCreateOrg}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="org_name" label="Name *" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} required />
              <Select label="Type" value={orgForm.org_type} onChange={(e) => setOrgForm({ ...orgForm, org_type: e.target.value as OrgType })}>
                {ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" size="sm" magnetic={false}>Create</Button>
              <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setShowOrgForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit p-4">
          <div className="flex items-center gap-2 px-2 py-2">
            <Building2 size={15} className="text-accent" />
            <h3 className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">Organizations ({orgs.length})</h3>
          </div>
          {orgs.length === 0 ? (
            <EmptyState icon={Building2} title="No organizations yet" />
          ) : (
            <div className="mt-2 space-y-1">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors',
                    selectedOrg?.id === org.id ? 'bg-accent text-text' : 'text-text-secondary hover:bg-white/5',
                  )}
                >
                  <span className="truncate font-body text-sm">{org.name}</span>
                  <span className="shrink-0 font-body text-[10px] uppercase text-inherit opacity-70">{org.org_type}</span>
                </button>
              ))}
            </div>
          )}
        </Card>

        {selectedOrg && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Members of {selectedOrg.name}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddMember} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Select value={memberForm.user} onChange={(e) => setMemberForm({ ...memberForm, user: e.target.value })} required className="mt-0">
                    <option value="">Select user</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} (@{u.username})</option>)}
                  </Select>
                  <Select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} required className="mt-0">
                    <option value="">Select role</option>
                    <optgroup label="System Roles">
                      {systemRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </optgroup>
                    {orgRoles.length > 0 && (
                      <optgroup label="Custom Roles">
                        {orgRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </optgroup>
                    )}
                  </Select>
                  <Button type="submit" size="sm" magnetic={false}>Add Member</Button>
                </form>

                {memberships.length === 0 ? (
                  <EmptyState icon={Users2} title="No members yet" />
                ) : (
                  <div className="space-y-2">
                    {memberships.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-white/[0.03] px-4 py-3">
                        <div>
                          <p className="font-body text-sm font-semibold text-text">{m.user_name}</p>
                          <p className="font-body text-xs text-text-muted">{m.role_name}{m.is_primary ? ' · Primary' : ''}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={m.is_active ? 'success' : 'default'}>{m.is_active ? 'Active' : 'Inactive'}</Badge>
                          <button onClick={() => handleRemoveMember(m.id)} className="font-body text-xs text-text-muted hover:text-accent-hover">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Available Roles</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[...systemRoles, ...orgRoles].map((role) => (
                  <div key={role.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-accent" />
                      <span className="font-body text-sm text-text">{role.name}</span>
                    </div>
                    <span className="font-body text-[11px] text-text-muted">{role.permission_count} perms</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
