import { useEffect, useState, type FormEvent } from 'react'
import { Building2, ChevronDown, ChevronUp, Pencil, Plus, ShieldCheck, Trash2, Users2 } from 'lucide-react'
import { academyAPI, adminAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { useToast } from '@/context/ToastContext'
import type { Organization, OrgRole, OrganizationMembership, AdminUser, OrgType, AppPermission } from '@/types'
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
const emptyRoleForm = { name: '', description: '', permission_ids: [] as number[] }

export default function OrganizationsAdmin() {
  const { showToast } = useToast()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [roles, setRoles] = useState<OrgRole[]>([])
  const [permissions, setPermissions] = useState<AppPermission[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [showOrgForm, setShowOrgForm] = useState(false)
  const [orgForm, setOrgForm] = useState(emptyOrgForm)
  const [memberForm, setMemberForm] = useState(emptyMemberForm)
  const [roleEditor, setRoleEditor] = useState<{ mode: 'create' | 'edit'; role?: OrgRole } | null>(null)
  const [roleForm, setRoleForm] = useState(emptyRoleForm)
  const [expandedModel, setExpandedModel] = useState<string | null>(null)

  const loadOrgs = async () => {
    try {
      const [orgRes, roleRes, userRes, permRes] = await Promise.all([
        academyAPI.getOrganizations(),
        academyAPI.getRoles(),
        adminAPI.getUsers(),
        academyAPI.getPermissions(),
      ])
      const orgList = parseListResponse(orgRes.data)
      setOrgs(orgList)
      setRoles(parseListResponse(roleRes.data))
      setUsers(parseListResponse(userRes.data))
      setPermissions(parseListResponse(permRes.data))
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

  const openCreateRole = () => {
    setRoleForm(emptyRoleForm)
    setRoleEditor({ mode: 'create' })
  }

  const openEditRole = (role: OrgRole) => {
    setRoleForm({
      name: role.name,
      description: role.description,
      permission_ids: role.permissions_detail.map((p) => p.id),
    })
    setRoleEditor({ mode: 'edit', role })
  }

  const togglePermission = (id: number) => {
    setRoleForm((prev) => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(id)
        ? prev.permission_ids.filter((p) => p !== id)
        : [...prev.permission_ids, id],
    }))
  }

  const toggleModelGroup = (ids: number[], allSelected: boolean) => {
    setRoleForm((prev) => ({
      ...prev,
      permission_ids: allSelected
        ? prev.permission_ids.filter((p) => !ids.includes(p))
        : [...new Set([...prev.permission_ids, ...ids])],
    }))
  }

  const handleSaveRole = async (e: FormEvent) => {
    e.preventDefault()
    if (!roleForm.name.trim()) return
    try {
      if (roleEditor?.mode === 'edit' && roleEditor.role) {
        const res = await academyAPI.updateRole(roleEditor.role.id, {
          name: roleForm.name,
          description: roleForm.description,
          permission_ids: roleForm.permission_ids,
        })
        setRoles((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)))
        showToast('Role updated', 'success')
      } else {
        if (!selectedOrg) return
        const res = await academyAPI.createRole({
          organization: selectedOrg.id,
          name: roleForm.name,
          description: roleForm.description,
          permission_ids: roleForm.permission_ids,
        })
        setRoles((prev) => [...prev, res.data])
        showToast('Custom role created', 'success')
      }
      setRoleEditor(null)
    } catch {
      showToast('Failed to save role — the name may already be in use for this organization', 'error')
    }
  }

  const handleDeleteRole = async (role: OrgRole) => {
    if (!window.confirm(`Delete the "${role.name}" role? Members holding it will need to be reassigned.`)) return
    try {
      await academyAPI.deleteRole(role.id)
      setRoles((prev) => prev.filter((r) => r.id !== role.id))
      showToast('Role deleted', 'success')
    } catch {
      showToast('Failed to delete role — it may still be assigned to members', 'error')
    }
  }

  const permissionsByModel = permissions.reduce<Record<string, AppPermission[]>>((acc, p) => {
    const key = `${p.app_label}.${p.model}`
    acc[key] = acc[key] || []
    acc[key].push(p)
    return acc
  }, {})

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
              <CardHeader>
                <CardTitle>Available Roles</CardTitle>
                <Button size="sm" variant="outline" magnetic={false} onClick={openCreateRole}><Plus size={14} /> New Custom Role</Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {systemRoles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-accent" />
                      <span className="font-body text-sm text-text">{role.name}</span>
                    </div>
                    <span className="font-body text-[11px] text-text-muted">{role.permission_count} perms</span>
                  </div>
                ))}
                {orgRoles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-accent" />
                      <span className="font-body text-sm text-text">{role.name}</span>
                      <span className="font-body text-[11px] text-text-muted">· {role.permission_count} perms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditRole(role)} className="text-text-muted hover:text-accent-hover" title="Edit permissions">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDeleteRole(role)} className="text-text-muted hover:text-red-400" title="Delete role">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {systemRoles.length === 0 && orgRoles.length === 0 && (
                  <EmptyState icon={ShieldCheck} title="No roles yet" />
                )}
              </CardContent>
            </Card>

            {roleEditor && (
              <Card className="p-6">
                <h3 className="mb-1 font-display text-base font-bold text-text">
                  {roleEditor.mode === 'edit' ? `Edit "${roleEditor.role?.name}"` : `New Custom Role for ${selectedOrg.name}`}
                </h3>
                <p className="mb-4 font-body text-xs text-text-muted">
                  Custom roles are scoped to this organization and can be assigned to members alongside the platform's system roles.
                </p>
                <form onSubmit={handleSaveRole}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input id="role_name" label="Name *" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} required />
                    <Input id="role_description" label="Description" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} />
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 font-body text-xs font-semibold uppercase tracking-widest text-text-muted">
                      Permissions ({roleForm.permission_ids.length} selected)
                    </p>
                    <div className="max-h-96 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
                      {Object.entries(permissionsByModel).map(([key, perms]) => {
                        const ids = perms.map((p) => p.id)
                        const allSelected = ids.every((id) => roleForm.permission_ids.includes(id))
                        const someSelected = ids.some((id) => roleForm.permission_ids.includes(id))
                        const isOpen = expandedModel === key
                        return (
                          <div key={key} className="rounded-lg bg-white/[0.03]">
                            <div className="flex items-center justify-between px-3 py-2">
                              <button
                                type="button"
                                onClick={() => setExpandedModel(isOpen ? null : key)}
                                className="flex flex-1 items-center gap-2 text-left font-body text-xs text-text-secondary"
                              >
                                {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                <span className="font-semibold text-text">{key}</span>
                                <span className="text-text-muted">({ids.filter((id) => roleForm.permission_ids.includes(id)).length}/{ids.length})</span>
                              </button>
                              <label className="flex items-center gap-1.5 font-body text-[11px] text-text-muted">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                                  onChange={() => toggleModelGroup(ids, allSelected)}
                                  className="accent-accent"
                                />
                                all
                              </label>
                            </div>
                            {isOpen && (
                              <div className="grid grid-cols-1 gap-1 px-3 pb-2 sm:grid-cols-2">
                                {perms.map((p) => (
                                  <label key={p.id} className="flex items-center gap-2 rounded-md px-2 py-1 font-body text-xs text-text-secondary hover:bg-white/5">
                                    <input
                                      type="checkbox"
                                      checked={roleForm.permission_ids.includes(p.id)}
                                      onChange={() => togglePermission(p.id)}
                                      className="accent-accent"
                                    />
                                    {p.name}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Button type="submit" size="sm" magnetic={false}>{roleEditor.mode === 'edit' ? 'Save Changes' : 'Create Role'}</Button>
                    <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setRoleEditor(null)}>Cancel</Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
