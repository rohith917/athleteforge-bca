/**
 * Domain types mirroring the Django REST API (backend/api/models.py + serializers.py).
 */

export type UserRole = 'admin' | 'coach' | 'student'

export interface AuthUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  athlete_id: number | null
  athlete_name: string | null
  profile_photo: string | null
  is_staff_role: boolean
  is_admin: boolean
}

export type Gender = 'Male' | 'Female' | 'Other'
export type AthleteStatus = 'Active' | 'Inactive' | 'Injured'

export interface Athlete {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  age: number
  gender: Gender
  sport: string
  team: string
  height_cm: number | null
  address: string
  emergency_contact: string
  emergency_phone: string
  status: AthleteStatus
  photo: string | null
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface AthleteProfileData extends Athlete {
  performance_count: number
  injury_count: number
  competition_count: number
  attendance_count: number
  latest_performance: Performance | null
  active_injuries: Injury[]
  latest_weight: WeightTracking | null
}

export type AthleteListItem = Pick<
  Athlete,
  'id' | 'first_name' | 'last_name' | 'full_name' | 'email' | 'sport' | 'team' | 'status' | 'gender' | 'date_of_birth' | 'avatar_url'
>

export interface Performance {
  id: number
  athlete: number
  athlete_name: string
  record_date: string
  speed_score: number | null
  strength_score: number | null
  endurance_score: number | null
  flexibility_score: number | null
  agility_score: number | null
  speed_value: number | null
  strength_value: number | null
  endurance_value: number | null
  flexibility_value: number | null
  agility_value: number | null
  notes: string
  recorded_by: number | null
  created_at: string
}

export type InjurySeverity = 'Minor' | 'Moderate' | 'Severe'
export type RecoveryStatus = 'Recovering' | 'Recovered' | 'Ongoing Treatment'

export interface Injury {
  id: number
  athlete: number
  athlete_name: string
  injury_type: string
  body_part: string
  injury_date: string
  severity: InjurySeverity
  recovery_status: RecoveryStatus
  expected_recovery_date: string | null
  actual_recovery_date: string | null
  medical_notes: string
  treatment_plan: string
  created_at: string
  updated_at: string
}

export type CompetitionLevel = 'Local' | 'State' | 'National' | 'International'
export type Medal = 'Gold' | 'Silver' | 'Bronze' | 'None'

export interface CompetitionResult {
  id: number
  competition: number
  athlete: number
  athlete_name: string
  position: number | null
  medal: Medal
  score: string
  notes: string
  created_at: string
}

export interface Competition {
  id: number
  name: string
  sport: string
  venue: string
  competition_date: string
  level: CompetitionLevel
  description: string
  results: CompetitionResult[]
  result_count: number
  created_at: string
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused'
export type SessionType = 'Training' | 'Competition' | 'Recovery' | 'Other'

export interface Attendance {
  id: number
  athlete: number
  athlete_name: string
  attendance_date: string
  status: AttendanceStatus
  session_type: SessionType
  notes: string
  marked_by: number | null
  created_at: string
}

export interface WeightTracking {
  id: number
  athlete: number
  athlete_name: string
  record_date: string
  weight_kg: number
  height_cm: number
  bmi: number | null
  bmi_category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' | 'Unknown'
  body_fat_percentage: number | null
  muscle_mass_kg: number | null
  notes: string
  created_at: string
}

export type GoalMetric =
  | 'speed_score' | 'strength_score' | 'endurance_score'
  | 'flexibility_score' | 'agility_score' | 'weight_kg' | 'attendance_rate'
export type GoalStatus = 'active' | 'achieved' | 'missed'

export interface GoalProgress {
  current_value: number | null
  percent: number
  on_track: boolean
}

export interface Goal {
  id: number
  athlete: number
  athlete_name: string
  metric: GoalMetric
  metric_label: string
  title: string
  start_value: number | null
  target_value: number
  target_date: string
  status: GoalStatus
  notes: string
  progress: GoalProgress
  created_by: number | null
  created_at: string
  achieved_at: string | null
}

export type AnnouncementAudience = 'all' | 'students' | 'coaches' | 'team'

export interface Announcement {
  id: number
  title: string
  message: string
  audience: AnnouncementAudience
  team_filter: string
  pinned: boolean
  created_by_name: string
  created_at: string
}

export type NotificationType = 'injury' | 'attendance' | 'competition' | 'goal' | 'announcement' | 'system'
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger'

export interface AppNotification {
  id: number
  notif_type: NotificationType
  severity: NotificationSeverity
  title: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

export interface NotificationsResponse {
  results: AppNotification[]
  unread_count: number
}

export interface AdminUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  athlete_id: number | null
  athlete_name: string | null
  is_active: boolean
  is_superuser: boolean
  last_login: string | null
  date_joined: string
}

export interface MedalCounts {
  gold: number
  silver: number
  bronze: number
  total: number
}

export interface DashboardStats {
  role: 'admin' | 'coach' | 'student'
  linked?: boolean
  message?: string
  total_athletes: number
  active_athletes: number
  injured_athletes: number
  active_injuries: number
  total_competitions: number
  gold_medals: number
  silver_medals: number
  bronze_medals: number
  avg_performance: { speed?: number; strength?: number; endurance?: number; flexibility?: number; agility?: number }
  sport_distribution: Array<{ sport: string; count: number }>
  injury_by_severity: Array<{ severity: string; count: number }>
  monthly_attendance: Array<{ month: string; rate: number }>
  performance_trend: Array<{ date: string; athlete: string; avg_score: number }>
  athlete?: Athlete | null
  ai_preview?: unknown
  total_users?: number
  active_users?: number
  inactive_users?: number
  users_by_role?: { admin: number; coach: number; student: number }
  total_performance_records?: number
  total_attendance_records?: number
  recent_users?: AdminUser[]
  unlinked_students?: number
}

export interface LeaderboardEntry {
  athlete_id: number
  athlete_name: string
  sport: string
  score: number
  gold: number
  silver: number
  bronze: number
  attendance_rate: number
  rank: number
}

/** Generic DRF paginated-or-plain list response shape used across list endpoints. */
export type ListResponse<T> = T[] | { results: T[]; count?: number; next?: string | null; previous?: string | null }
