import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, Clock, PlayCircle, FileText, Box, ClipboardList, Award } from 'lucide-react'
import { academyAPI } from '@/services/api'
import { useToast } from '@/context/ToastContext'
import type { CourseDetail as CourseDetailType, LessonType } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FullScreenLoader } from '@/components/ui/Spinner'

const TYPE_ICON: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  text: FileText,
  pdf: FileText,
  presentation: FileText,
  exercise_demo: Box,
  assignment: ClipboardList,
  practical_assessment: ClipboardList,
}

const LEVEL_VARIANT = { beginner: 'success', intermediate: 'warning', advanced: 'danger' } as const

export default function CourseDetail() {
  const { slug } = useParams()
  const { showToast } = useToast()
  const [course, setCourse] = useState<CourseDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  const load = () => {
    if (!slug) return
    academyAPI.getCourse(slug)
      .then((res) => setCourse(res.data))
      .catch(() => showToast('Failed to load course', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [slug])

  const handleEnroll = async () => {
    if (!slug) return
    setEnrolling(true)
    try {
      await academyAPI.enroll(slug)
      showToast('Enrolled! Start with the first lesson.', 'success')
      load()
    } catch {
      showToast('Failed to enroll', 'error')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <FullScreenLoader message="Loading course..." />
  if (!course) return <Card className="p-6"><p className="font-body text-sm text-accent-hover">Course not found.</p></Card>

  const firstLesson = course.modules[0]?.lessons[0]

  return (
    <div>
      <Link to="/dashboard/academy">
        <Button variant="outline" size="sm" magnetic={false} className="mb-6"><ArrowLeft size={15} /> Back to Academy</Button>
      </Link>

      <Card className="p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={LEVEL_VARIANT[course.level]}>{course.level}</Badge>
          <span className="font-body text-xs text-text-muted">{course.category_name}</span>
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-text">{course.title}</h1>
        <p className="mt-2 font-body text-sm text-text-secondary">{course.subtitle}</p>
        <p className="mt-4 font-body text-sm leading-relaxed text-text-secondary">{course.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-border pt-6">
          <span className="flex items-center gap-2 font-body text-xs text-text-muted"><Clock size={14} /> {course.estimated_hours} hours</span>
          <span className="flex items-center gap-2 font-body text-xs text-text-muted"><FileText size={14} /> {course.lesson_count} lessons</span>

          {course.is_enrolled ? (
            <>
              {course.progress_percent != null && (
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-accent" style={{ width: `${course.progress_percent}%` }} />
                  </div>
                  <span className="font-body text-xs text-text-muted">{course.progress_percent}%</span>
                </div>
              )}
              {firstLesson && (
                <Link to={`/dashboard/academy/${course.slug}/lessons/${firstLesson.slug}`} className="ml-auto">
                  <Button size="sm" magnetic={false}>{course.progress_percent ? 'Continue' : 'Start Course'}</Button>
                </Link>
              )}
            </>
          ) : (
            <Button size="sm" magnetic={false} className="ml-auto" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {course.modules.map((module) => (
          <Card key={module.id}>
            <CardHeader><CardTitle>{module.title}</CardTitle></CardHeader>
            <CardContent className="space-y-2 p-4">
              {module.lessons.map((lesson) => {
                const Icon = TYPE_ICON[lesson.lesson_type]
                const content = (
                  <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/5">
                    {lesson.is_completed ? (
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                    ) : (
                      <Circle size={18} className="shrink-0 text-text-muted" />
                    )}
                    <Icon size={16} className="shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body text-sm text-text">{lesson.title}</p>
                    </div>
                    {lesson.has_quiz && <Badge variant="accent">Quiz</Badge>}
                    <span className="font-body text-xs text-text-muted">{lesson.estimated_minutes} min</span>
                  </div>
                )
                return course.is_enrolled ? (
                  <Link key={lesson.id} to={`/dashboard/academy/${course.slug}/lessons/${lesson.slug}`}>{content}</Link>
                ) : (
                  <div key={lesson.id} className="opacity-60">{content}</div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {course.progress_percent === 100 && (
        <Card className="mt-6 flex items-center gap-4 p-6">
          <Award size={28} className="shrink-0 text-accent" />
          <div>
            <h3 className="font-body text-sm font-semibold text-text">Course complete!</h3>
            <p className="mt-0.5 font-body text-xs text-text-secondary">Your certificate has been issued — check My Certificates.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
