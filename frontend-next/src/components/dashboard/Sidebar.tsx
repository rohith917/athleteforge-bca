import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Users, LineChart, HeartPulse, Trophy, ClipboardCheck,
  Scale, FileText, User, ShieldCheck, Home, Medal, Megaphone, GraduationCap, Building2, Dumbbell, Smile,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface NavItem {
  path: string
  icon: typeof LayoutDashboard
  label: string
  end?: boolean
}

const adminNav: NavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Admin Panel', end: true },
  { path: '/dashboard/academy', icon: GraduationCap, label: 'Academy' },
  { path: '/dashboard/admin/users', icon: ShieldCheck, label: 'User Management' },
  { path: '/dashboard/admin/organizations', icon: Building2, label: 'Organizations & Roles' },
  { path: '/dashboard/training', icon: Dumbbell, label: 'Training Programs' },
  { path: '/dashboard/monitoring', icon: Smile, label: 'Athlete Monitoring' },
  { path: '/dashboard/athletes', icon: Users, label: 'Athletes' },
  { path: '/dashboard/performance', icon: LineChart, label: 'Performance' },
  { path: '/dashboard/injuries', icon: HeartPulse, label: 'Injuries' },
  { path: '/dashboard/competitions', icon: Trophy, label: 'Competitions' },
  { path: '/dashboard/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { path: '/dashboard/weight', icon: Scale, label: 'Weight' },
  { path: '/dashboard/leaderboard', icon: Medal, label: 'Leaderboard' },
  { path: '/dashboard/announcements', icon: Megaphone, label: 'Announcements' },
  { path: '/dashboard/reports', icon: FileText, label: 'Reports' },
]

const coachNav: NavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Coach Dashboard', end: true },
  { path: '/dashboard/academy', icon: GraduationCap, label: 'Academy' },
  { path: '/dashboard/training', icon: Dumbbell, label: 'Training Programs' },
  { path: '/dashboard/monitoring', icon: Smile, label: 'Athlete Monitoring' },
  { path: '/dashboard/athletes', icon: Users, label: 'My Athletes' },
  { path: '/dashboard/performance', icon: LineChart, label: 'Performance' },
  { path: '/dashboard/injuries', icon: HeartPulse, label: 'Injury Tracking' },
  { path: '/dashboard/competitions', icon: Trophy, label: 'Competitions' },
  { path: '/dashboard/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { path: '/dashboard/weight', icon: Scale, label: 'Weight Tracking' },
  { path: '/dashboard/leaderboard', icon: Medal, label: 'Leaderboard' },
  { path: '/dashboard/announcements', icon: Megaphone, label: 'Announcements' },
  { path: '/dashboard/reports', icon: FileText, label: 'Reports' },
]

const studentNav: NavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'My Dashboard', end: true },
  { path: '/dashboard/academy', icon: GraduationCap, label: 'Academy' },
  { path: '/dashboard/training', icon: Dumbbell, label: 'My Training' },
  { path: '/dashboard/monitoring', icon: Smile, label: 'My Wellness' },
  { path: '/dashboard/performance', icon: LineChart, label: 'My Performance' },
  { path: '/dashboard/injuries', icon: HeartPulse, label: 'My Injuries' },
  { path: '/dashboard/attendance', icon: ClipboardCheck, label: 'My Attendance' },
  { path: '/dashboard/leaderboard', icon: Medal, label: 'Leaderboard' },
  { path: '/dashboard/announcements', icon: Megaphone, label: 'Announcements' },
]

const ROLE_META = {
  admin: { label: 'Administrator', icon: ShieldCheck },
  coach: { label: 'Coach Panel', icon: Users },
  student: { label: 'Athlete Portal', icon: User },
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { isAdmin, isStudent, isCoach, user } = useAuth()
  const roleKey = isAdmin ? 'admin' : isStudent ? 'student' : 'coach'
  const roleMeta = ROLE_META[roleKey]
  const RoleIcon = roleMeta.icon
  const navItems = isAdmin ? adminNav : isStudent ? studentNav : coachNav
  const profilePath = isStudent && user?.athlete_id ? `/dashboard/athletes/${user.athlete_id}` : null

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background-secondary transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Link to="/" className="flex items-center px-7 py-7 font-display text-lg font-extrabold tracking-tight text-text">
          ATHLETE<span className="text-accent">FORGE</span>
        </Link>

        <div className="mx-5 flex items-center gap-2 rounded-xl bg-accent-soft px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-accent-hover">
          <RoleIcon size={15} /> {roleMeta.label}
        </div>

        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto px-4">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text"
          >
            <Home size={17} /> Home
          </NavLink>

          <div className="px-4 pb-1 pt-5 font-body text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            {isStudent ? 'My Data' : isCoach ? 'Team Management' : 'System'}
          </div>

          {navItems.map(({ path, icon: Icon, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-text' : 'text-text-secondary hover:bg-white/5 hover:text-text',
                )
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}

          {profilePath && (
            <NavLink
              to={profilePath}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-text' : 'text-text-secondary hover:bg-white/5 hover:text-text',
                )
              }
            >
              <User size={17} /> My Profile
            </NavLink>
          )}
        </nav>

        <div className="border-t border-border px-6 py-5 font-body text-[11px] text-text-muted">
          © 2026 AthleteForge
        </div>
      </aside>
    </>
  )
}
