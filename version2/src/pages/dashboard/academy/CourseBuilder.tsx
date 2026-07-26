import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ChevronDown, ChevronRight, HelpCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { academyAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { useToast } from '@/context/ToastContext'
import type {
  CourseListItem, CourseDetail, CourseCategory, CourseInput, CourseLevel, CourseStatus,
  LessonInput, LessonType, QuizInput,
} from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { cn } from '@/lib/utils'

const LEVELS: CourseLevel[] = ['beginner', 'intermediate', 'advanced']
const STATUSES: CourseStatus[] = ['draft', 'published', 'archived']
const LESSON_TYPES: LessonType[] = ['text', 'video', 'pdf', 'presentation', 'exercise_demo', 'assignment', 'practical_assessment']

const emptyCourseForm: CourseInput = {
  title: '', subtitle: '', description: '', category: 0, level: 'beginner', status: 'draft', estimated_hours: '1.0',
}
const emptyModuleForm = { title: '', description: '' }
const emptyLessonForm: Omit<LessonInput, 'module'> = {
  title: '', lesson_type: 'text', order: 1, estimated_minutes: 10,
  learning_objectives: '', content: '', scientific_explanation: '', practical_application: '',
  key_coaching_points: '', common_mistakes: '', safety_considerations: '', progressions: '', regressions: '',
  summary: '', references: '', video_url: '', pdf_url: '', has_3d_demo: false, model_3d_ref: '', is_published: true,
}
const emptyQuizForm = (lessonId: number): QuizInput => ({ lesson: lessonId, title: '', passing_score_percent: 70, questions: [] })

function flattenCategories(cats: CourseCategory[]): CourseCategory[] {
  return cats.flatMap((c) => [c, ...flattenCategories(c.children)])
}

export default function CourseBuilder() {
  const { showToast } = useToast()
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [loading, setLoading] = useState(true)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [courseLoading, setCourseLoading] = useState(false)

  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseForm, setCourseForm] = useState<CourseInput>(emptyCourseForm)
  const [editingCourseMeta, setEditingCourseMeta] = useState(false)

  const [showModuleForm, setShowModuleForm] = useState(false)
  const [moduleForm, setModuleForm] = useState(emptyModuleForm)

  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  const [lessonModuleId, setLessonModuleId] = useState<number | null>(null)
  const [lessonForm, setLessonForm] = useState(emptyLessonForm)
  const [editingLessonSlug, setEditingLessonSlug] = useState<string | null>(null)

  const [quizLessonId, setQuizLessonId] = useState<number | null>(null)
  const [quizId, setQuizId] = useState<number | null>(null)
  const [quizForm, setQuizForm] = useState<QuizInput>(emptyQuizForm(0))

  const flatCategories = useMemo(() => flattenCategories(categories), [categories])

  const loadCourses = async () => {
    try {
      const [courseRes, catRes] = await Promise.all([academyAPI.getCourses(), academyAPI.getCategories()])
      setCourses(parseListResponse(courseRes.data))
      setCategories(parseListResponse(catRes.data))
    } catch {
      showToast('Failed to load courses', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCourses() }, [])

  const loadCourseDetail = async (slug: string) => {
    setCourseLoading(true)
    try {
      const res = await academyAPI.getCourse(slug)
      setCourse(res.data)
    } catch {
      showToast('Failed to load course', 'error')
    } finally {
      setCourseLoading(false)
    }
  }

  const openCreateCourse = () => {
    setCourseForm({ ...emptyCourseForm, category: flatCategories[0]?.id ?? 0 })
    setEditingCourseMeta(false)
    setShowCourseForm(true)
  }

  const openEditCourseMeta = () => {
    if (!course) return
    setCourseForm({
      title: course.title, subtitle: course.subtitle, description: course.description,
      category: course.category, level: course.level, status: course.status, estimated_hours: course.estimated_hours,
    })
    setEditingCourseMeta(true)
    setShowCourseForm(true)
  }

  const handleSaveCourse = async (e: FormEvent) => {
    e.preventDefault()
    if (!courseForm.title.trim() || !courseForm.category) return
    try {
      if (editingCourseMeta && course) {
        await academyAPI.updateCourse(course.slug, courseForm)
        showToast('Course updated', 'success')
        await loadCourseDetail(course.slug)
        loadCourses()
      } else {
        const res = await academyAPI.createCourse(courseForm)
        showToast('Course created', 'success')
        await loadCourses()
        await loadCourseDetail(res.data.slug)
      }
      setShowCourseForm(false)
    } catch {
      showToast('Failed to save course — check all fields are filled in', 'error')
    }
  }

  const handleDeleteCourse = async (c: CourseListItem) => {
    if (!window.confirm(`Delete "${c.title}"? This permanently removes all its modules, lessons, and quizzes.`)) return
    try {
      await academyAPI.deleteCourse(c.slug)
      showToast('Course deleted', 'success')
      if (course?.slug === c.slug) setCourse(null)
      loadCourses()
    } catch {
      showToast('Failed to delete course', 'error')
    }
  }

  const handleAddModule = async (e: FormEvent) => {
    e.preventDefault()
    if (!course || !moduleForm.title.trim()) return
    try {
      await academyAPI.createModule({
        course: course.id, title: moduleForm.title, description: moduleForm.description,
        order: course.modules.length + 1,
      })
      showToast('Module added', 'success')
      setModuleForm(emptyModuleForm)
      setShowModuleForm(false)
      loadCourseDetail(course.slug)
    } catch {
      showToast('Failed to add module', 'error')
    }
  }

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm('Delete this module and all its lessons?')) return
    try {
      await academyAPI.deleteModule(moduleId)
      showToast('Module deleted', 'success')
      if (course) loadCourseDetail(course.slug)
    } catch {
      showToast('Failed to delete module', 'error')
    }
  }

  const openAddLesson = (moduleId: number) => {
    const mod = course?.modules.find((m) => m.id === moduleId)
    setLessonForm({ ...emptyLessonForm, order: (mod?.lessons.length ?? 0) + 1 })
    setLessonModuleId(moduleId)
    setEditingLessonSlug(null)
    setQuizLessonId(null)
  }

  const openEditLesson = async (lessonSlug: string, moduleId: number) => {
    try {
      const res = await academyAPI.getLesson(lessonSlug)
      const l = res.data
      setLessonForm({
        title: l.title, lesson_type: l.lesson_type, order: l.order, estimated_minutes: l.estimated_minutes,
        learning_objectives: l.learning_objectives, content: l.content, scientific_explanation: l.scientific_explanation,
        practical_application: l.practical_application, key_coaching_points: l.key_coaching_points,
        common_mistakes: l.common_mistakes, safety_considerations: l.safety_considerations,
        progressions: l.progressions, regressions: l.regressions, summary: l.summary, references: l.references,
        video_url: l.video_url, pdf_url: l.pdf_url, has_3d_demo: l.has_3d_demo, model_3d_ref: l.model_3d_ref,
        is_published: true,
      })
      setLessonModuleId(moduleId)
      setEditingLessonSlug(lessonSlug)
      setQuizLessonId(null)
    } catch {
      showToast('Failed to load lesson', 'error')
    }
  }

  const closeLessonForm = () => { setLessonModuleId(null); setEditingLessonSlug(null) }

  const handleSaveLesson = async (e: FormEvent) => {
    e.preventDefault()
    if (!lessonModuleId || !lessonForm.title.trim() || !course) return
    try {
      if (editingLessonSlug) {
        await academyAPI.updateLesson(editingLessonSlug, lessonForm)
        showToast('Lesson updated', 'success')
      } else {
        await academyAPI.createLesson({ ...lessonForm, module: lessonModuleId })
        showToast('Lesson added', 'success')
      }
      closeLessonForm()
      loadCourseDetail(course.slug)
    } catch {
      showToast('Failed to save lesson', 'error')
    }
  }

  const handleDeleteLesson = async (slug: string) => {
    if (!window.confirm('Delete this lesson?')) return
    if (!course) return
    try {
      await academyAPI.deleteLesson(slug)
      showToast('Lesson deleted', 'success')
      loadCourseDetail(course.slug)
    } catch {
      showToast('Failed to delete lesson', 'error')
    }
  }

  const openQuizEditor = async (lessonId: number) => {
    try {
      const res = await academyAPI.getQuiz(lessonId)
      const existing = parseListResponse(res.data)[0]
      if (existing) {
        setQuizId(existing.id)
        setQuizForm(existing)
      } else {
        setQuizId(null)
        setQuizForm(emptyQuizForm(lessonId))
      }
      setQuizLessonId(lessonId)
      setLessonModuleId(null)
    } catch {
      showToast('Failed to load quiz', 'error')
    }
  }

  const addQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, {
        question_text: '', explanation: '', order: prev.questions.length,
        choices: [
          { choice_text: '', is_correct: true, order: 0 },
          { choice_text: '', is_correct: false, order: 1 },
        ],
      }],
    }))
  }

  const removeQuestion = (qIdx: number) => {
    setQuizForm((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qIdx) }))
  }

  const updateQuestion = (qIdx: number, field: 'question_text' | 'explanation', value: string) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === qIdx ? { ...q, [field]: value } : q)),
    }))
  }

  const addChoice = (qIdx: number) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (
        i === qIdx ? { ...q, choices: [...q.choices, { choice_text: '', is_correct: false, order: q.choices.length }] } : q
      )),
    }))
  }

  const removeChoice = (qIdx: number, cIdx: number) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (
        i === qIdx ? { ...q, choices: q.choices.filter((_, j) => j !== cIdx) } : q
      )),
    }))
  }

  const updateChoiceText = (qIdx: number, cIdx: number, value: string) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (
        i === qIdx ? { ...q, choices: q.choices.map((c, j) => (j === cIdx ? { ...c, choice_text: value } : c)) } : q
      )),
    }))
  }

  const setCorrectChoice = (qIdx: number, cIdx: number) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (
        i === qIdx ? { ...q, choices: q.choices.map((c, j) => ({ ...c, is_correct: j === cIdx })) } : q
      )),
    }))
  }

  const closeQuizEditor = () => { setQuizLessonId(null); setQuizId(null) }

  const handleSaveQuiz = async (e: FormEvent) => {
    e.preventDefault()
    if (!quizForm.title.trim() || quizForm.questions.length === 0) {
      showToast('Add a title and at least one question', 'error')
      return
    }
    try {
      if (quizId) {
        await academyAPI.updateQuiz(quizId, quizForm)
      } else {
        await academyAPI.createQuiz(quizForm)
      }
      showToast('Quiz saved', 'success')
      closeQuizEditor()
      if (course) loadCourseDetail(course.slug)
    } catch {
      showToast('Failed to save quiz', 'error')
    }
  }

  const handleDeleteQuiz = async () => {
    if (!quizId || !window.confirm('Delete this quiz?')) return
    try {
      await academyAPI.deleteQuiz(quizId)
      showToast('Quiz deleted', 'success')
      closeQuizEditor()
      if (course) loadCourseDetail(course.slug)
    } catch {
      showToast('Failed to delete quiz', 'error')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>

  return (
    <div>
      <PageHeader
        title="Course Builder"
        description="Author and publish Academy courses — modules, lessons, and quizzes"
        actions={<Button size="sm" magnetic={false} onClick={openCreateCourse}><Plus size={16} /> New Course</Button>}
      />

      {showCourseForm && (
        <Card className="mb-6 p-6">
          <h3 className="mb-4 font-display text-base font-bold text-text">
            {editingCourseMeta ? `Edit "${course?.title}"` : 'New Course'}
          </h3>
          <form onSubmit={handleSaveCourse}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="c_title" label="Title *" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
              <Input id="c_subtitle" label="Subtitle" value={courseForm.subtitle} onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })} />
            </div>
            <div className="mt-4">
              <Textarea id="c_description" label="Description" rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select label="Category *" value={courseForm.category || ''} onChange={(e) => setCourseForm({ ...courseForm, category: Number(e.target.value) })} required>
                <option value="">Select category</option>
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.sport_name ? `${c.sport_name} — ${c.name}` : c.name}</option>
                ))}
              </Select>
              <Select label="Level" value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as CourseLevel })}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
              <Select label="Status" value={courseForm.status} onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as CourseStatus })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Input id="c_hours" label="Estimated Hours" type="number" step="0.1" value={courseForm.estimated_hours} onChange={(e) => setCourseForm({ ...courseForm, estimated_hours: e.target.value })} />
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" size="sm" magnetic={false}>{editingCourseMeta ? 'Save Changes' : 'Create Course'}</Button>
              <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setShowCourseForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit p-4">
          <h3 className="px-2 py-2 font-body text-xs font-semibold uppercase tracking-widest text-text-muted">
            All Courses ({courses.length})
          </h3>
          {courses.length === 0 ? (
            <EmptyState icon={Plus} title="No courses yet" />
          ) : (
            <div className="mt-2 space-y-1">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadCourseDetail(c.slug)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors',
                    course?.id === c.id ? 'bg-accent text-text' : 'text-text-secondary hover:bg-white/5',
                  )}
                >
                  <span className="truncate font-body text-sm">{c.title}</span>
                  <Badge variant={c.status === 'published' ? 'success' : c.status === 'draft' ? 'default' : 'warning'}>{c.status}</Badge>
                </button>
              ))}
            </div>
          )}
        </Card>

        {courseLoading ? (
          <div className="flex justify-center py-20"><Spinner size={28} /></div>
        ) : !course ? (
          <Card className="flex items-center justify-center p-12">
            <EmptyState icon={Plus} title="Select a course to edit, or create a new one" />
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={course.status === 'published' ? 'success' : course.status === 'draft' ? 'default' : 'warning'}>{course.status}</Badge>
                    <Badge>{course.level}</Badge>
                  </div>
                  <h2 className="font-display text-xl font-bold text-text">{course.title}</h2>
                  <p className="mt-1 font-body text-sm text-text-muted">{course.subtitle}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" magnetic={false} onClick={openEditCourseMeta}><Pencil size={13} /> Edit</Button>
                  <Button size="sm" variant="outline" magnetic={false} onClick={() => handleDeleteCourse(course)}><Trash2 size={13} /></Button>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modules ({course.modules.length})</CardTitle>
                <Button size="sm" variant="outline" magnetic={false} onClick={() => setShowModuleForm((v) => !v)}><Plus size={14} /> Add Module</Button>
              </CardHeader>
              <CardContent>
                {showModuleForm && (
                  <form onSubmit={handleAddModule} className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_2fr_auto]">
                    <Input id="m_title" label="Module Title *" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} required />
                    <Input id="m_desc" label="Description" value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} />
                    <div className="flex items-end"><Button type="submit" size="sm" magnetic={false}>Add</Button></div>
                  </form>
                )}

                {course.modules.length === 0 ? (
                  <EmptyState icon={Plus} title="No modules yet — add one to start adding lessons" />
                ) : (
                  <div className="space-y-3">
                    {course.modules.map((mod) => (
                      <div key={mod.id} className="rounded-xl border border-border">
                        <div className="flex items-center justify-between px-4 py-3">
                          <button
                            onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                            className="flex flex-1 items-center gap-2 text-left font-body text-sm font-semibold text-text"
                          >
                            {expandedModule === mod.id ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            {mod.title}
                            <span className="font-body text-xs font-normal text-text-muted">({mod.lessons.length} lessons)</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" magnetic={false} onClick={() => openAddLesson(mod.id)}><Plus size={12} /> Lesson</Button>
                            <button onClick={() => handleDeleteModule(mod.id)} className="text-text-muted hover:text-red-400"><Trash2 size={14} /></button>
                          </div>
                        </div>

                        {expandedModule === mod.id && (
                          <div className="space-y-1 border-t border-border p-3">
                            {mod.lessons.length === 0 ? (
                              <p className="px-2 py-2 font-body text-xs text-text-muted">No lessons in this module yet.</p>
                            ) : mod.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-body text-sm text-text">{lesson.title}</span>
                                  <Badge variant={lesson.is_published ? 'success' : 'default'}>{lesson.is_published ? 'published' : 'draft'}</Badge>
                                  {lesson.has_quiz && <Badge variant="warning">quiz</Badge>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => openQuizEditor(lesson.id)} className="text-text-muted hover:text-accent-hover" title="Manage quiz">
                                    <HelpCircle size={14} />
                                  </button>
                                  <button onClick={() => openEditLesson(lesson.slug, mod.id)} className="text-text-muted hover:text-accent-hover" title="Edit lesson">
                                    <Pencil size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteLesson(lesson.slug)} className="text-text-muted hover:text-red-400" title="Delete lesson">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {lessonModuleId && (
              <Card className="p-6">
                <h3 className="mb-4 font-display text-base font-bold text-text">
                  {editingLessonSlug ? 'Edit Lesson' : 'New Lesson'}
                </h3>
                <form onSubmit={handleSaveLesson} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Input id="l_title" label="Title *" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
                    <Select label="Lesson Type" value={lessonForm.lesson_type} onChange={(e) => setLessonForm({ ...lessonForm, lesson_type: e.target.value as LessonType })}>
                      {LESSON_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </Select>
                    <Input id="l_minutes" label="Estimated Minutes" type="number" value={lessonForm.estimated_minutes} onChange={(e) => setLessonForm({ ...lessonForm, estimated_minutes: Number(e.target.value) })} />
                  </div>
                  <Textarea id="l_objectives" label="Learning Objectives" value={lessonForm.learning_objectives} onChange={(e) => setLessonForm({ ...lessonForm, learning_objectives: e.target.value })} />
                  <Textarea id="l_content" label="Content" rows={4} value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
                  <Textarea id="l_science" label="Scientific Explanation" rows={3} value={lessonForm.scientific_explanation} onChange={(e) => setLessonForm({ ...lessonForm, scientific_explanation: e.target.value })} />
                  <Textarea id="l_practical" label="Practical Application" rows={3} value={lessonForm.practical_application} onChange={(e) => setLessonForm({ ...lessonForm, practical_application: e.target.value })} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Textarea id="l_coaching" label="Key Coaching Points" value={lessonForm.key_coaching_points} onChange={(e) => setLessonForm({ ...lessonForm, key_coaching_points: e.target.value })} />
                    <Textarea id="l_mistakes" label="Common Mistakes" value={lessonForm.common_mistakes} onChange={(e) => setLessonForm({ ...lessonForm, common_mistakes: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Textarea id="l_safety" label="Safety Considerations" value={lessonForm.safety_considerations} onChange={(e) => setLessonForm({ ...lessonForm, safety_considerations: e.target.value })} />
                    <Textarea id="l_summary" label="Summary" value={lessonForm.summary} onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Textarea id="l_progressions" label="Progressions" value={lessonForm.progressions} onChange={(e) => setLessonForm({ ...lessonForm, progressions: e.target.value })} />
                    <Textarea id="l_regressions" label="Regressions" value={lessonForm.regressions} onChange={(e) => setLessonForm({ ...lessonForm, regressions: e.target.value })} />
                  </div>
                  <Textarea id="l_references" label="References" value={lessonForm.references} onChange={(e) => setLessonForm({ ...lessonForm, references: e.target.value })} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input id="l_video" label="Video URL" value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
                    <Input id="l_pdf" label="PDF URL" value={lessonForm.pdf_url} onChange={(e) => setLessonForm({ ...lessonForm, pdf_url: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-2 font-body text-sm text-text-secondary">
                    <input type="checkbox" checked={lessonForm.is_published} onChange={(e) => setLessonForm({ ...lessonForm, is_published: e.target.checked })} className="accent-accent" />
                    Published (visible to enrolled athletes)
                  </label>
                  <div className="flex gap-3">
                    <Button type="submit" size="sm" magnetic={false}>{editingLessonSlug ? 'Save Changes' : 'Add Lesson'}</Button>
                    <Button type="button" variant="outline" size="sm" magnetic={false} onClick={closeLessonForm}>Cancel</Button>
                  </div>
                </form>
              </Card>
            )}

            {quizLessonId && (
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-text">{quizId ? 'Edit Quiz' : 'New Quiz'}</h3>
                  {quizId && <Button size="sm" variant="outline" magnetic={false} onClick={handleDeleteQuiz}><Trash2 size={13} /> Delete Quiz</Button>}
                </div>
                <form onSubmit={handleSaveQuiz} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <Input id="q_title" label="Quiz Title *" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required />
                    </div>
                    <Input id="q_pass" label="Passing Score %" type="number" value={quizForm.passing_score_percent} onChange={(e) => setQuizForm({ ...quizForm, passing_score_percent: Number(e.target.value) })} />
                  </div>

                  <div className="space-y-4">
                    {quizForm.questions.map((q, qIdx) => (
                      <div key={qIdx} className="rounded-xl border border-border p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <span className="mt-2 font-body text-xs font-semibold text-text-muted">Q{qIdx + 1}</span>
                          <div className="flex-1">
                            <Textarea id={`q_text_${qIdx}`} label="Question Text" rows={2} value={q.question_text} onChange={(e) => updateQuestion(qIdx, 'question_text', e.target.value)} />
                          </div>
                          <button type="button" onClick={() => removeQuestion(qIdx)} className="mt-6 text-text-muted hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                        <Textarea id={`q_exp_${qIdx}`} label="Explanation (shown after answering)" rows={2} value={q.explanation} onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)} />
                        <div className="mt-3 space-y-2">
                          <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">Choices (select the correct one)</p>
                          {q.choices.map((c, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-2">
                              <input type="radio" name={`correct_${qIdx}`} checked={c.is_correct} onChange={() => setCorrectChoice(qIdx, cIdx)} className="accent-accent" />
                              <input
                                value={c.choice_text}
                                onChange={(e) => updateChoiceText(qIdx, cIdx, e.target.value)}
                                placeholder={`Choice ${cIdx + 1}`}
                                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-body text-sm text-text outline-none focus:border-accent"
                              />
                              <button type="button" onClick={() => removeChoice(qIdx, cIdx)} className="text-text-muted hover:text-red-400"><Trash2 size={13} /></button>
                            </div>
                          ))}
                          <Button type="button" size="sm" variant="outline" magnetic={false} onClick={() => addChoice(qIdx)}><Plus size={12} /> Choice</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button type="button" size="sm" variant="outline" magnetic={false} onClick={addQuestion}><Plus size={14} /> Add Question</Button>

                  <div className="flex gap-3 border-t border-border pt-4">
                    <Button type="submit" size="sm" magnetic={false}>Save Quiz</Button>
                    <Button type="button" variant="outline" size="sm" magnetic={false} onClick={closeQuizEditor}>Cancel</Button>
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
