import { useEffect, useState, type FormEvent, type DragEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, GripVertical, Plus, Trash2, CheckCircle2, Circle, Calendar, PlayCircle, Box, ImageIcon } from 'lucide-react'
import { trainingAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { TrainingProgramDetail, ProgramBlockItem, ProgramExerciseItem, BlockType } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { FullScreenLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { cn } from '@/lib/utils'

const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: 'warm_up', label: 'Warm-Up' }, { value: 'activation', label: 'Activation' },
  { value: 'strength', label: 'Strength' }, { value: 'power', label: 'Power' },
  { value: 'plyometrics', label: 'Plyometrics' }, { value: 'speed', label: 'Speed' },
  { value: 'endurance', label: 'Endurance' }, { value: 'sport_specific', label: 'Sport-Specific Drills' },
  { value: 'tactical', label: 'Tactical Session' }, { value: 'mobility', label: 'Mobility' },
  { value: 'flexibility', label: 'Flexibility' }, { value: 'cool_down', label: 'Cool-Down' },
  { value: 'recovery', label: 'Recovery' },
]

function reorderIds<T extends { id: number }>(items: T[], draggedId: number, targetId: number): number[] {
  const ids = items.map((i) => i.id)
  const from = ids.indexOf(draggedId)
  const to = ids.indexOf(targetId)
  if (from === -1 || to === -1 || from === to) return ids
  ids.splice(from, 1)
  ids.splice(to, 0, draggedId)
  return ids
}

export default function ProgramBuilder() {
  const { id } = useParams()
  const { isStaff } = useAuth()
  const { showToast } = useToast()
  const [program, setProgram] = useState<TrainingProgramDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDayForm, setShowDayForm] = useState(false)
  const [dayForm, setDayForm] = useState({ date: '', label: '' })
  const [blockForms, setBlockForms] = useState<Record<number, boolean>>({})
  const [exerciseForms, setExerciseForms] = useState<Record<number, boolean>>({})
  const [dragBlock, setDragBlock] = useState<number | null>(null)
  const [dragExercise, setDragExercise] = useState<number | null>(null)
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null)

  const load = () => {
    if (!id) return
    trainingAPI.getProgram(Number(id))
      .then((res) => setProgram(res.data))
      .catch(() => showToast('Failed to load program', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleAddDay = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await trainingAPI.addDay(Number(id), dayForm)
      setDayForm({ date: '', label: '' })
      setShowDayForm(false)
      load()
    } catch {
      showToast('Failed to add day', 'error')
    }
  }

  const handleAddBlock = async (dayId: number, blockType: BlockType, title: string) => {
    try {
      await trainingAPI.createBlock({ day: dayId, block_type: blockType, title })
      setBlockForms({ ...blockForms, [dayId]: false })
      load()
    } catch {
      showToast('Failed to add block', 'error')
    }
  }

  const handleAddExercise = async (blockId: number, data: { name: string; sets: string; reps: string; load: string; rest_seconds: string; image_url: string; video_url: string }) => {
    try {
      await trainingAPI.createExercise({
        block: blockId,
        name: data.name,
        sets: data.sets ? Number(data.sets) : undefined,
        reps: data.reps,
        load: data.load,
        rest_seconds: data.rest_seconds ? Number(data.rest_seconds) : undefined,
        image_url: data.image_url,
        video_url: data.video_url,
      })
      setExerciseForms({ ...exerciseForms, [blockId]: false })
      load()
    } catch {
      showToast('Failed to add exercise', 'error')
    }
  }

  const handleDeleteBlock = async (blockId: number) => {
    if (!window.confirm('Delete this block and all its exercises?')) return
    await trainingAPI.deleteBlock(blockId)
    load()
  }

  const handleDeleteExercise = async (exerciseId: number) => {
    await trainingAPI.deleteExercise(exerciseId)
    load()
  }

  const handleToggleComplete = async (exerciseId: number) => {
    try {
      await trainingAPI.completeExercise(exerciseId)
      load()
    } catch {
      showToast('Failed to update', 'error')
    }
  }

  const handleBlockDrop = async (blocks: ProgramBlockItem[], targetId: number) => {
    if (dragBlock == null || dragBlock === targetId) return
    const order = reorderIds(blocks, dragBlock, targetId)
    setDragBlock(null)
    await trainingAPI.reorderBlocks(order)
    load()
  }

  const handleExerciseDrop = async (exercises: ProgramExerciseItem[], targetId: number) => {
    if (dragExercise == null || dragExercise === targetId) return
    const order = reorderIds(exercises, dragExercise, targetId)
    setDragExercise(null)
    await trainingAPI.reorderExercises(order)
    load()
  }

  if (loading) return <FullScreenLoader message="Loading program..." />
  if (!program) return <Card className="p-6"><p className="font-body text-sm text-accent-hover">Program not found.</p></Card>

  return (
    <div>
      <Link to="/dashboard/training">
        <Button variant="outline" size="sm" magnetic={false} className="mb-6"><ArrowLeft size={15} /> Training Programs</Button>
      </Link>

      <PageHeader
        title={program.name}
        description={`${program.athlete_name}${program.sport ? ` · ${program.sport}` : ''} · ${program.day_count} days`}
        actions={isStaff ? (
          <Button size="sm" magnetic={false} onClick={() => setShowDayForm((v) => !v)}><Plus size={16} /> Add Day</Button>
        ) : undefined}
      />

      {showDayForm && (
        <Card className="mb-6 p-6">
          <form onSubmit={handleAddDay} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input id="day_date" type="date" label="Date *" value={dayForm.date} onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })} required />
            <Input id="day_label" label="Label" placeholder="e.g. Week 1 - Monday" value={dayForm.label} onChange={(e) => setDayForm({ ...dayForm, label: e.target.value })} />
            <Button type="submit" size="sm" magnetic={false} className="self-end">Add Day</Button>
          </form>
        </Card>
      )}

      {program.days.length === 0 ? (
        <Card><EmptyState icon={Calendar} title="No days added yet" description={isStaff ? 'Click "Add Day" to start building this program.' : 'Your coach hasn\'t added any days yet.'} /></Card>
      ) : (
        <div className="space-y-6">
          {program.days.map((day) => (
            <Card key={day.id} className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-text">{day.label || day.date}</h3>
                  <p className="font-body text-xs text-text-muted">{day.date}</p>
                </div>
                {isStaff && (
                  <button onClick={() => setBlockForms({ ...blockForms, [day.id]: !blockForms[day.id] })} className="flex items-center gap-1.5 font-body text-xs font-semibold text-accent hover:text-accent-hover">
                    <Plus size={14} /> Add Block
                  </button>
                )}
              </div>

              {blockForms[day.id] && (
                <BlockForm dayId={day.id} onSubmit={handleAddBlock} />
              )}

              {day.blocks.length === 0 ? (
                <p className="font-body text-xs text-text-muted">No blocks yet.</p>
              ) : (
                <div className="space-y-3">
                  {day.blocks.map((block) => (
                    <div
                      key={block.id}
                      draggable={isStaff}
                      onDragStart={() => setDragBlock(block.id)}
                      onDragOver={(e: DragEvent) => e.preventDefault()}
                      onDrop={() => handleBlockDrop(day.blocks, block.id)}
                      className={cn('rounded-xl border border-border bg-white/[0.03] p-4', isStaff && 'cursor-move')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isStaff && <GripVertical size={14} className="text-text-muted" />}
                          <Badge variant="accent">{block.block_type_display}</Badge>
                          {block.title && <span className="font-body text-sm font-semibold text-text">{block.title}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          {isStaff && (
                            <button onClick={() => setExerciseForms({ ...exerciseForms, [block.id]: !exerciseForms[block.id] })} className="font-body text-xs font-semibold text-accent hover:text-accent-hover">
                              + Exercise
                            </button>
                          )}
                          {isStaff && (
                            <button onClick={() => handleDeleteBlock(block.id)} className="text-text-muted hover:text-accent-hover">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {exerciseForms[block.id] && (
                        <ExerciseForm blockId={block.id} onSubmit={handleAddExercise} />
                      )}

                      {block.exercises.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {block.exercises.map((ex) => {
                            const hasMedia = Boolean(ex.image_url || ex.video_url || ex.has_3d_demo)
                            const isExpanded = expandedExercise === ex.id
                            return (
                              <div key={ex.id} className="rounded-lg bg-background">
                                <div
                                  draggable={isStaff}
                                  onDragStart={() => setDragExercise(ex.id)}
                                  onDragOver={(e: DragEvent) => e.preventDefault()}
                                  onDrop={() => handleExerciseDrop(block.exercises, ex.id)}
                                  className={cn('flex items-center gap-3 px-3 py-2.5', isStaff && 'cursor-move')}
                                >
                                  {isStaff ? (
                                    <GripVertical size={13} className="shrink-0 text-text-muted" />
                                  ) : (
                                    <button onClick={() => handleToggleComplete(ex.id)} className="shrink-0">
                                      {ex.is_completed ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} className="text-text-muted" />}
                                    </button>
                                  )}
                                  {hasMedia ? (
                                    <button
                                      onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                                      className="flex flex-1 items-center gap-2 text-left"
                                    >
                                      <span className="font-body text-sm text-text">{ex.name}</span>
                                      {ex.image_url && <ImageIcon size={12} className="shrink-0 text-accent" />}
                                      {ex.video_url && <PlayCircle size={12} className="shrink-0 text-accent" />}
                                      {ex.has_3d_demo && <Box size={12} className="shrink-0 text-accent" />}
                                    </button>
                                  ) : (
                                    <span className="flex-1 font-body text-sm text-text">{ex.name}</span>
                                  )}
                                  <span className="font-body text-xs text-text-muted">
                                    {[ex.sets && `${ex.sets} sets`, ex.reps, ex.load].filter(Boolean).join(' · ')}
                                  </span>
                                  {isStaff && (
                                    <button onClick={() => handleDeleteExercise(ex.id)} className="text-text-muted hover:text-accent-hover">
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>

                                {isExpanded && (
                                  <div className="space-y-3 border-t border-border px-3 py-3">
                                    {ex.image_url && (
                                      <img src={ex.image_url} alt={ex.name} className="max-h-64 w-full rounded-lg object-cover" />
                                    )}
                                    {ex.video_url && (
                                      <div className="aspect-video overflow-hidden rounded-lg bg-black">
                                        <iframe src={ex.video_url} className="size-full" allowFullScreen title={ex.name} />
                                      </div>
                                    )}
                                    {ex.has_3d_demo && (
                                      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border-strong p-4">
                                        <Box size={18} className="text-accent" />
                                        <p className="font-body text-xs text-text-secondary">3D demonstration coming in a future update.</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function BlockForm({ dayId, onSubmit }: { dayId: number; onSubmit: (dayId: number, type: BlockType, title: string) => void }) {
  const [type, setType] = useState<BlockType>('warm_up')
  const [title, setTitle] = useState('')
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-white/5 p-4">
      <Select label="Block Type" value={type} onChange={(e) => setType(e.target.value as BlockType)}>
        {BLOCK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </Select>
      <Input id={`block_title_${dayId}`} label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Button size="sm" magnetic={false} onClick={() => onSubmit(dayId, type, title)}>Add</Button>
    </div>
  )
}

function ExerciseForm({
  blockId, onSubmit,
}: {
  blockId: number
  onSubmit: (blockId: number, data: { name: string; sets: string; reps: string; load: string; rest_seconds: string; image_url: string; video_url: string }) => void
}) {
  const [data, setData] = useState({ name: '', sets: '', reps: '', load: '', rest_seconds: '', image_url: '', video_url: '' })
  return (
    <div className="mt-3 space-y-2 rounded-xl bg-white/5 p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Input id={`ex_name_${blockId}`} label="Exercise *" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
        <Input id={`ex_sets_${blockId}`} type="number" label="Sets" value={data.sets} onChange={(e) => setData({ ...data, sets: e.target.value })} />
        <Input id={`ex_reps_${blockId}`} label="Reps" placeholder="8-10" value={data.reps} onChange={(e) => setData({ ...data, reps: e.target.value })} />
        <Input id={`ex_load_${blockId}`} label="Load" placeholder="bodyweight" value={data.load} onChange={(e) => setData({ ...data, load: e.target.value })} />
        <Button size="sm" magnetic={false} className="self-end" onClick={() => data.name && onSubmit(blockId, data)}>Add</Button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input id={`ex_image_${blockId}`} label="Photo URL (optional)" placeholder="https://…" value={data.image_url} onChange={(e) => setData({ ...data, image_url: e.target.value })} />
        <Input id={`ex_video_${blockId}`} label="Video URL (optional)" placeholder="https://youtube.com/embed/…" value={data.video_url} onChange={(e) => setData({ ...data, video_url: e.target.value })} />
      </div>
    </div>
  )
}
