import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { athletesAPI } from '@/services/api'
import { parseListResponse, getLoadErrorMessage } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { AthleteListItem } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { SearchFilterBar } from '@/components/dashboard/SearchFilterBar'
import { AthleteCard } from '@/components/dashboard/AthleteCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

export default function Athletes() {
  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { isStaff } = useAuth()
  const { showToast } = useToast()
  const debouncedSearch = useDebouncedValue(search)

  const fetchAthletes = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params: Record<string, string> = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (statusFilter) params.status = statusFilter
      const res = await athletesAPI.getAll(params)
      setAthletes(parseListResponse(res.data))
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'athletes'))
      setAthletes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAthletes() }, [debouncedSearch, statusFilter])

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await athletesAPI.delete(id)
      showToast(`"${name}" removed`, 'success')
      fetchAthletes()
    } catch {
      showToast('Delete failed', 'error')
    }
  }

  const counts = {
    total: athletes.length,
    active: athletes.filter((a) => a.status === 'Active').length,
    injured: athletes.filter((a) => a.status === 'Injured').length,
  }

  return (
    <div>
      <PageHeader
        title="Athlete Management"
        description="Elite roster intelligence · Readiness · Performance profiles"
        actions={isStaff ? (
          <Link to="/dashboard/athletes/new">
            <Button size="sm" magnetic={false}><Plus size={16} /> Add Athlete</Button>
          </Link>
        ) : undefined}
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search athletes..."
        filters={[{
          key: 'status',
          value: statusFilter,
          onChange: setStatusFilter,
          placeholder: 'All Status',
          options: [
            { value: 'Active', label: 'Active' },
            { value: 'Injured', label: 'Injured' },
            { value: 'Inactive', label: 'Inactive' },
          ],
        }]}
        right={
          <>
            <span><strong className="text-text">{counts.total}</strong> Total</span>
            <span><strong className="text-emerald-400">{counts.active}</strong> Active</span>
            <span><strong className="text-red-400">{counts.injured}</strong> Injured</span>
          </>
        }
      />

      {loadError && (
        <Card className="mb-6 flex items-center justify-between p-4">
          <p className="font-body text-sm text-accent-hover">{loadError}</p>
          <button onClick={fetchAthletes} className="font-body text-xs font-semibold uppercase text-accent hover:text-accent-hover">Retry</button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : !loadError && athletes.length === 0 ? (
        <Card><EmptyState icon={Users} title="No athletes found" description="Try adjusting your search or filters." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {athletes.map((a) => (
            <AthleteCard key={a.id} athlete={a} isStaff={isStaff} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
