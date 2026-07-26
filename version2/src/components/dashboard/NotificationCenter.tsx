import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BellOff, AlertTriangle, Trophy, Target, Megaphone, ClipboardCheck, Info } from 'lucide-react'
import { notificationsAPI } from '@/services/api'
import type { AppNotification, NotificationType } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<NotificationType, typeof Info> = {
  injury: AlertTriangle,
  attendance: ClipboardCheck,
  competition: Trophy,
  goal: Target,
  announcement: Megaphone,
  system: Info,
}

export function NotificationCenter({ onRead }: { onRead?: () => void }) {
  const [items, setItems] = useState<AppNotification[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    notificationsAPI.getAll()
      .then((res) => { if (active) setItems(res.data.results) })
      .catch(() => { if (active) setItems([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const markRead = async (id: number) => {
    try {
      await notificationsAPI.markRead(id)
      setItems((prev) => prev?.map((n) => (n.id === id ? { ...n, is_read: true } : n)) ?? null)
      onRead?.()
    } catch {
      /* ignore */
    }
  }

  const markAll = async () => {
    try {
      await notificationsAPI.markAllRead()
      setItems((prev) => prev?.map((n) => ({ ...n, is_read: true })) ?? null)
      onRead?.()
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="w-80">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">Notifications</span>
        {!!items?.length && (
          <button onClick={markAll} className="font-body text-[11px] font-semibold text-accent hover:text-accent-hover">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-8"><Spinner /></div>
        )}
        {!loading && items?.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <BellOff size={22} className="text-text-muted" />
            <p className="font-body text-xs text-text-muted">You're all caught up</p>
          </div>
        )}
        {items?.map((n) => {
          const Icon = TYPE_ICONS[n.notif_type] || Info
          const content = (
            <div
              className={cn(
                'flex gap-3 border-b border-border px-4 py-3.5 transition-colors hover:bg-white/5',
                !n.is_read && 'bg-accent-soft/40',
              )}
            >
              <Icon size={16} className="mt-0.5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="font-body text-sm font-semibold text-text">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 font-body text-xs text-text-secondary">{n.message}</p>
                <p className="mt-1 font-body text-[11px] text-text-muted">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" />}
            </div>
          )
          return n.link ? (
            <Link key={n.id} to={n.link} onClick={() => markRead(n.id)}>{content}</Link>
          ) : (
            <button key={n.id} onClick={() => markRead(n.id)} className="block w-full text-left">{content}</button>
          )
        })}
      </div>
    </div>
  )
}
