import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Clock, Layers, Award, Flame } from 'lucide-react'
import { academyAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { CourseListItem, Sport, LearningSummary } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { SearchFilterBar } from '@/components/dashboard/SearchFilterBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { StatCard } from '@/components/dashboard/StatCard'

const LEVEL_VARIANT = { beginner: 'success', intermediate: 'warning', advanced: 'danger' } as const

export default function AcademyCatalog() {
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [summary, setSummary] = useState<LearningSummary | null>(null)
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    academyAPI.getSports().then((res) => setSports(parseListResponse(res.data))).catch(() => {})
    academyAPI.getLearningSummary().then((res) => setSummary(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (sportFilter) params.sport = sportFilter
    if (levelFilter) params.level = levelFilter
    academyAPI.getCourses(params)
      .then((res) => setCourses(parseListResponse(res.data)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [debouncedSearch, sportFilter, levelFilter])

  return (
    <div>
      <PageHeader title="Sports Science Academy" description="Evidence-based courses in exercise science, coaching, and sport-specific development" />

      {summary && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={GraduationCap} label="Enrolled Courses" value={summary.courses_enrolled} accent />
          <StatCard icon={Layers} label="Completed" value={summary.courses_completed} />
          <StatCard icon={Award} label="Certificates" value={summary.certificates_earned} />
          <StatCard icon={Flame} label="Learning Streak" value={summary.streak.current_streak_days} suffix=" days" />
        </div>
      )}

      {summary?.continue_learning && (
        <Card className="mb-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-accent">Continue Learning</p>
            <h3 className="mt-1 font-display text-lg font-bold text-text">{summary.continue_learning.course.title}</h3>
            <p className="mt-1 font-body text-xs text-text-muted">{summary.continue_learning.progress_percent}% complete</p>
          </div>
          <Link
            to={`/dashboard/academy/${summary.continue_learning.course.slug}`}
            className="rounded-full bg-accent px-6 py-3 font-body text-sm font-semibold text-text hover:bg-accent-hover"
          >
            Resume
          </Link>
        </Card>
      )}

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search courses..."
        filters={[
          {
            key: 'sport',
            value: sportFilter,
            onChange: setSportFilter,
            placeholder: 'All Sports',
            options: sports.map((s) => ({ value: s.slug, label: s.name })),
          },
          {
            key: 'level',
            value: levelFilter,
            onChange: setLevelFilter,
            placeholder: 'All Levels',
            options: [
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ],
          },
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : courses.length === 0 ? (
        <Card><EmptyState icon={GraduationCap} title="No courses found" description="Try a different search or filter — more courses are added regularly." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} to={`/dashboard/academy/${course.slug}`}>
              <Card className="flex h-full flex-col p-6 transition-colors hover:border-border-strong">
                <div className="flex items-center justify-between">
                  <Badge variant={LEVEL_VARIANT[course.level]}>{course.level}</Badge>
                  {course.is_enrolled && <Badge variant="accent">Enrolled</Badge>}
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-text">{course.title}</h3>
                <p className="mt-1 line-clamp-2 flex-1 font-body text-xs text-text-secondary">{course.subtitle}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 font-body text-[11px] text-text-muted">
                  <span className="flex items-center gap-1.5"><Layers size={12} /> {course.lesson_count} lessons</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {course.estimated_hours}h</span>
                </div>
                <p className="mt-2 font-body text-[11px] uppercase tracking-widest text-accent">{course.category_name}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
