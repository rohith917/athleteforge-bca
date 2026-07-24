import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2, Lightbulb, Target, AlertTriangle,
  ShieldAlert, ListChecks, ChevronDown, HelpCircle, Box,
} from 'lucide-react'
import { academyAPI } from '@/services/api'
import { useToast } from '@/context/ToastContext'
import type { LessonDetail as LessonDetailType } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FullScreenLoader } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

function Section({ icon: Icon, title, body }: { icon: typeof Lightbulb; title: string; body: string }) {
  if (!body) return null
  return (
    <div className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-accent" />
        <h3 className="font-body text-sm font-bold uppercase tracking-widest text-text">{title}</h3>
      </div>
      <p className="mt-3 font-body text-sm leading-relaxed text-text-secondary">{body}</p>
    </div>
  )
}

export default function LessonPlayer() {
  const { courseSlug, lessonSlug } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [lesson, setLesson] = useState<LessonDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [quizResult, setQuizResult] = useState<{ score_percent: number; passed: boolean; passing_score_percent: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)

  const load = () => {
    if (!lessonSlug) return
    setLoading(true)
    academyAPI.getLesson(lessonSlug)
      .then((res) => setLesson(res.data))
      .catch(() => showToast('Failed to load lesson', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [lessonSlug])

  const handleComplete = async () => {
    if (!lessonSlug) return
    setCompleting(true)
    try {
      const res = await academyAPI.completeLesson(lessonSlug)
      showToast(res.data.course_completed ? 'Lesson complete — course finished! Certificate issued.' : 'Lesson marked complete', 'success')
      load()
    } catch {
      showToast('Failed to mark complete', 'error')
    } finally {
      setCompleting(false)
    }
  }

  const handleBookmark = async () => {
    if (!lessonSlug) return
    try {
      const res = await academyAPI.bookmarkLesson(lessonSlug)
      setLesson((l) => l ? { ...l, is_bookmarked: res.data.is_bookmarked } : l)
    } catch {
      showToast('Failed to bookmark', 'error')
    }
  }

  const handleSubmitQuiz = async () => {
    if (!lessonSlug || !lesson?.quiz) return
    if (Object.keys(answers).length < lesson.quiz.questions.length) {
      showToast('Answer every question first', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await academyAPI.submitQuiz(lessonSlug, answers)
      setQuizResult(res.data)
      if (res.data.passed) {
        showToast(`Passed with ${res.data.score_percent}%!`, 'success')
        load()
      } else {
        showToast(`Scored ${res.data.score_percent}% — need ${res.data.passing_score_percent}% to pass. Try again.`, 'error')
      }
    } catch {
      showToast('Failed to submit quiz', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <FullScreenLoader message="Loading lesson..." />
  if (!lesson) return <Card className="p-6"><p className="font-body text-sm text-accent-hover">Lesson not found.</p></Card>

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/dashboard/academy/${courseSlug}`}>
        <Button variant="outline" size="sm" magnetic={false} className="mb-6"><ArrowLeft size={15} /> {lesson.course_title}</Button>
      </Link>

      <Card className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-accent">{lesson.module_title}</p>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-text">{lesson.title}</h1>
            <p className="mt-1 font-body text-xs text-text-muted">{lesson.estimated_minutes} min</p>
          </div>
          <button onClick={handleBookmark} className="shrink-0 text-text-muted hover:text-accent">
            {lesson.is_bookmarked ? <BookmarkCheck size={20} className="text-accent" /> : <Bookmark size={20} />}
          </button>
        </div>

        {lesson.has_3d_demo && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-border-strong bg-white/[0.03] p-5">
            <Box size={20} className="text-accent" />
            <p className="font-body text-xs text-text-secondary">3D demonstration for this movement is coming in a future update.</p>
          </div>
        )}

        {lesson.video_url && (
          <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-black">
            <iframe src={lesson.video_url} className="size-full" allowFullScreen title={lesson.title} />
          </div>
        )}

        <div className="mt-2">
          <Section icon={Target} title="Learning Objectives" body={lesson.learning_objectives} />
          {lesson.content && (
            <div className="border-t border-border py-6 first:border-t-0 first:pt-0">
              <p className="font-body text-sm leading-relaxed text-text-secondary">{lesson.content}</p>
            </div>
          )}
          <Section icon={Lightbulb} title="Scientific Explanation" body={lesson.scientific_explanation} />
          <Section icon={ListChecks} title="Practical Application" body={lesson.practical_application} />
          <Section icon={CheckCircle2} title="Key Coaching Points" body={lesson.key_coaching_points} />
          <Section icon={AlertTriangle} title="Common Mistakes" body={lesson.common_mistakes} />
          <Section icon={ShieldAlert} title="Safety Considerations" body={lesson.safety_considerations} />
          <Section icon={ListChecks} title="Progressions" body={lesson.progressions} />
          <Section icon={ListChecks} title="Regressions" body={lesson.regressions} />
          <Section icon={Lightbulb} title="Summary" body={lesson.summary} />
        </div>

        {lesson.faqs.length > 0 && (
          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <HelpCircle size={16} className="text-accent" />
              <h3 className="font-body text-sm font-bold uppercase tracking-widest text-text">FAQ</h3>
            </div>
            <div className="mt-3 space-y-2">
              {lesson.faqs.map((faq) => (
                <div key={faq.id} className="rounded-xl border border-border">
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="font-body text-sm text-text">{faq.question}</span>
                    <ChevronDown size={16} className={cn('shrink-0 text-text-muted transition-transform', openFaq === faq.id && 'rotate-180')} />
                  </button>
                  {openFaq === faq.id && (
                    <p className="border-t border-border px-4 py-3 font-body text-sm text-text-secondary">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {lesson.references && (
          <div className="mt-6 border-t border-border pt-6">
            <p className="font-body text-[11px] uppercase tracking-widest text-text-muted">References</p>
            <p className="mt-2 font-body text-xs text-text-muted">{lesson.references}</p>
          </div>
        )}

        {lesson.quiz ? (
          <div className="mt-8 rounded-2xl border border-border bg-white/[0.03] p-6">
            <h3 className="font-display text-base font-bold text-text">{lesson.quiz.title}</h3>
            <p className="mt-1 font-body text-xs text-text-muted">Pass with {lesson.quiz.passing_score_percent}% or higher to complete this lesson.</p>

            <div className="mt-5 space-y-6">
              {lesson.quiz.questions.map((q, qi) => (
                <div key={q.id}>
                  <p className="font-body text-sm font-semibold text-text">{qi + 1}. {q.question_text}</p>
                  <div className="mt-3 space-y-2">
                    {q.choices.map((choice) => (
                      <label
                        key={choice.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                          answers[String(q.id)] === choice.id ? 'border-accent bg-accent-soft' : 'border-border hover:border-border-strong',
                        )}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[String(q.id)] === choice.id}
                          onChange={() => setAnswers({ ...answers, [String(q.id)]: choice.id })}
                          className="accent-accent"
                        />
                        <span className="font-body text-sm text-text">{choice.choice_text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {quizResult && (
              <div className={cn('mt-5 rounded-xl p-4 text-center', quizResult.passed ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                <p className={cn('font-display text-2xl font-extrabold', quizResult.passed ? 'text-emerald-400' : 'text-red-400')}>
                  {quizResult.score_percent}%
                </p>
                <p className="mt-1 font-body text-xs text-text-secondary">{quizResult.passed ? 'Passed' : `Needs ${quizResult.passing_score_percent}% to pass`}</p>
              </div>
            )}

            <Button className="mt-5 w-full" magnetic={false} onClick={handleSubmitQuiz} disabled={submitting || lesson.is_completed}>
              {lesson.is_completed ? 'Completed' : submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        ) : (
          <div className="mt-8 border-t border-border pt-6">
            <Button className="w-full" magnetic={false} onClick={handleComplete} disabled={completing || lesson.is_completed}>
              {lesson.is_completed ? <><CheckCircle2 size={16} /> Completed</> : completing ? 'Saving...' : 'Mark as Complete'}
            </Button>
          </div>
        )}
      </Card>

      <button onClick={() => navigate(`/dashboard/academy/${courseSlug}`)} className="mt-4 font-body text-xs text-text-muted hover:text-text">
        Back to course outline
      </button>
    </div>
  )
}
