import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { notificationsAPI } from '@/services/api'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'
import { AthleteQuickSearch } from '@/components/dashboard/AthleteQuickSearch'

const ROLE_LABELS = { admin: 'Admin', coach: 'Coach', student: 'Student' } as const
const PAGE_TITLES = { admin: 'Admin Command Center', coach: 'Coach Command Center', student: 'Athlete Portal' } as const

export function DashboardHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const navigate = useNavigate()
  const { user, logout, isStaff, isAdmin, isStudent, isCoach, actionLoading, getErrorMessage } = useAuth()
  const { showToast } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const bellRef = useRef<HTMLDivElement>(null)

  const roleKey = isAdmin ? 'admin' : isStudent ? 'student' : 'coach'

  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const res = await notificationsAPI.getAll()
        if (active) setUnread(res.data?.unread_count || 0)
      } catch {
        /* bell just shows 0 */
      }
    }
    poll()
    const interval = setInterval(poll, 60000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const handleLogout = async () => {
    if (loggingOut || actionLoading) return
    setLoggingOut(true)
    try {
      await logout({ hardRedirect: true })
    } catch (err) {
      showToast(getErrorMessage(err, 'Logout failed. Clearing session...'), 'error')
      window.location.assign('/')
    } finally {
      setLoggingOut(false)
    }
  }

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'User'

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl lg:px-10">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button onClick={onMenuToggle} className="flex size-10 items-center justify-center rounded-lg text-text-secondary hover:bg-white/5 hover:text-text lg:hidden">
          <Menu size={18} />
        </button>
        <h1 className="hidden font-display text-sm font-bold uppercase tracking-widest text-text md:block">
          {PAGE_TITLES[roleKey]}
        </h1>
        {isStaff && <AthleteQuickSearch onSelect={(id) => navigate(`/dashboard/athletes/${id}`)} />}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative flex size-10 items-center justify-center rounded-lg text-text-secondary hover:bg-white/5 hover:text-text"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent font-body text-[9px] font-bold text-text">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {bellOpen && (
            <div className="glass absolute right-0 top-12 z-40 overflow-hidden rounded-2xl shadow-2xl">
              <NotificationCenter onRead={() => setUnread((u) => Math.max(0, u - 1))} />
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 sm:flex">
          <div className="flex size-7 items-center justify-center rounded-full bg-accent font-body text-xs font-bold text-text">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="font-body text-sm text-text">{displayName}</span>
          {user?.role && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 font-body text-[10px] font-semibold uppercase text-text-muted">
              {ROLE_LABELS[user.role]}
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut || actionLoading}
          className="flex items-center gap-2 rounded-full border border-border-strong px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-widest text-text-secondary transition-colors hover:text-text disabled:opacity-50"
        >
          <LogOut size={14} /> <span className="hidden md:inline">{loggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </header>
  )
}
