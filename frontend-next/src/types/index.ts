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

export interface PerformanceDashboardData {
  labels: string[]
  speed: number[]
  strength: number[]
  endurance: number[]
  flexibility: number[]
  agility: number[]
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

export interface BMIResult {
  bmi: number
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese'
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
  name: string
  sport: string
  team: string
  avatar_url: string
  overall_score: number
  gold: number
  silver: number
  bronze: number
  medal_points: number
  attendance_rate: number
  composite_score: number
  rank: number
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  sports: string[]
}

export interface AttendanceReport {
  total_records: number
  present: number
  absent: number
  late: number
  attendance_rate: number
  records: Attendance[]
}

/** Generic DRF paginated-or-plain list response shape used across list endpoints. */
export type ListResponse<T> = T[] | { results: T[]; count?: number; next?: string | null; previous?: string | null }

// ==================== Academy (LMS) ====================

export interface Sport {
  id: number
  name: string
  slug: string
  description: string
  icon: string
}

export interface CourseCategory {
  id: number
  name: string
  slug: string
  description: string
  parent: number | null
  sport: number | null
  sport_name: string | null
  order: number
  course_count: number
  children: CourseCategory[]
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatus = 'draft' | 'published' | 'archived'

export interface CourseListItem {
  id: number
  title: string
  slug: string
  subtitle: string
  category: number
  category_name: string
  sport_name: string | null
  level: CourseLevel
  status: CourseStatus
  cover_image: string | null
  estimated_hours: string
  lesson_count: number
  is_enrolled: boolean
  created_at: string
  published_at: string | null
}

export interface CourseDetail extends CourseListItem {
  description: string
  modules: CourseModule[]
  progress_percent: number | null
}

export interface CourseModule {
  id: number
  title: string
  description: string
  order: number
  lessons: LessonBrief[]
}

export type LessonType =
  | 'video' | 'text' | 'pdf' | 'presentation' | 'exercise_demo' | 'assignment' | 'practical_assessment'

export interface LessonBrief {
  id: number
  title: string
  slug: string
  lesson_type: LessonType
  order: number
  estimated_minutes: number
  has_3d_demo: boolean
  is_published: boolean
  is_completed: boolean
  has_quiz: boolean
}

export interface LessonFAQItem {
  id: number
  question: string
  answer: string
  order: number
}

export interface QuizChoiceItem {
  id: number
  choice_text: string
  order: number
}

export interface QuizQuestionItem {
  id: number
  question_text: string
  order: number
  choices: QuizChoiceItem[]
}

export interface QuizDetail {
  id: number
  title: string
  passing_score_percent: number
  questions: QuizQuestionItem[]
}

export interface AssignmentDetail {
  id: number
  instructions: string
  submission_type: 'text' | 'file' | 'video'
}

export interface LessonDetail {
  id: number
  title: string
  slug: string
  lesson_type: LessonType
  order: number
  estimated_minutes: number
  learning_objectives: string
  content: string
  scientific_explanation: string
  practical_application: string
  key_coaching_points: string
  common_mistakes: string
  safety_considerations: string
  progressions: string
  regressions: string
  summary: string
  references: string
  video_url: string
  pdf_url: string
  has_3d_demo: boolean
  model_3d_ref: string
  faqs: LessonFAQItem[]
  attachments: { id: number; title: string; file: string; created_at: string }[]
  quiz: QuizDetail | null
  assignment: AssignmentDetail | null
  course_id: number
  course_title: string
  module_title: string
  is_completed: boolean
  is_bookmarked: boolean
}

export interface Enrollment {
  id: number
  course: CourseListItem
  enrolled_at: string
  completed_at: string | null
  last_accessed_at: string
  progress_percent: number
  is_completed: boolean
}

export interface Certificate {
  id: number
  certificate_number: string
  course: number
  course_title: string
  user_name: string
  issued_at: string
}

export interface LearningStreakData {
  current_streak_days: number
  longest_streak_days: number
  last_activity_date: string | null
}

export interface LearningSummary {
  continue_learning: Enrollment | null
  courses_enrolled: number
  courses_completed: number
  certificates_earned: number
  streak: LearningStreakData
}

export interface QuizSubmitResult {
  score_percent: number
  passed: boolean
  passing_score_percent: number
  attempt_id: number
}

export interface ResearchSummaryItem {
  id: number
  title: string
  slug: string
  topic: number | null
  topic_name: string | null
  summary: string
  practical_takeaways: string
  last_reviewed: string | null
}

export type OrgType = 'academy' | 'club' | 'university' | 'federation' | 'independent'

export interface Organization {
  id: number
  name: string
  slug: string
  org_type: OrgType
  parent_organization: number | null
  logo: string | null
  is_active: boolean
  created_at: string
}

export interface AppPermission {
  id: number
  codename: string
  name: string
  app_label: string
  model: string
}

export interface OrgRole {
  id: number
  organization: number | null
  name: string
  slug: string
  description: string
  is_system: boolean
  permission_count: number
  permissions_detail: AppPermission[]
}

export interface OrganizationMembership {
  id: number
  user: number
  user_name: string
  organization: number
  organization_name: string
  role: number
  role_name: string
  is_primary: boolean
  is_active: boolean
  joined_at: string
}

// ==================== Training Program Builder ====================

export type ProgramStatus = 'draft' | 'active' | 'completed' | 'archived'

export type BlockType =
  | 'warm_up' | 'activation' | 'strength' | 'power' | 'plyometrics' | 'speed'
  | 'endurance' | 'sport_specific' | 'tactical' | 'mobility' | 'flexibility'
  | 'cool_down' | 'recovery'

export interface ProgramExerciseItem {
  id: number
  block: number
  name: string
  sets: number | null
  reps: string
  load: string
  rest_seconds: number | null
  tempo: string
  notes: string
  order: number
  is_completed: boolean | null
  image_url: string
  video_url: string
  has_3d_demo: boolean
  model_3d_ref: string
}

export interface ProgramBlockItem {
  id: number
  day: number
  block_type: BlockType
  block_type_display: string
  title: string
  notes: string
  order: number
  exercises: ProgramExerciseItem[]
}

export interface ProgramDayItem {
  id: number
  program: number
  date: string
  label: string
  order: number
  blocks: ProgramBlockItem[]
}

export interface TrainingProgramListItem {
  id: number
  name: string
  athlete: number
  athlete_name: string
  coach: number | null
  coach_name: string | null
  sport: string
  status: ProgramStatus
  start_date: string | null
  end_date: string | null
  notes: string
  day_count: number
  created_at: string
  updated_at: string
}

export interface TrainingProgramDetail extends TrainingProgramListItem {
  days: ProgramDayItem[]
}

// ==================== Athlete Monitoring ====================

export interface WellnessCheckInItem {
  id: number
  athlete: number
  athlete_name: string
  date: string
  sleep_hours: string | null
  sleep_quality: number
  fatigue: number
  soreness: number
  stress: number
  mood: number
  resting_heart_rate: number | null
  notes: string
  wellness_score: number
  created_at: string
}

export interface SessionRPEItem {
  id: number
  athlete: number
  athlete_name: string
  session_date: string
  rpe: number
  duration_minutes: number
  session_type: string
  notes: string
  training_load: number
  created_at: string
}

// ==================== AI Training Program Generator ====================

export type ProgramGoal =
  | 'strength' | 'hypertrophy' | 'power' | 'endurance' | 'speed_agility' | 'general_fitness' | 'return_to_play'

export interface GeneratorStatus {
  available: boolean
  mode: 'llm' | 'rules'
  label: string
  goals: ProgramGoal[]
}

export interface GenerateProgramPayload {
  athlete: number
  name?: string
  sport: string
  goal: ProgramGoal
  duration_weeks: number
  sessions_per_week: number
  start_date: string
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  equipment_notes?: string
  injury_notes?: string
}

export interface GeneratedProgram extends TrainingProgramDetail {
  generator_mode: 'llm' | 'rules'
}
