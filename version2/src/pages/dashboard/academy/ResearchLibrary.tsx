import { useEffect, useState } from 'react'
import { BookOpen, ChevronDown, CalendarCheck } from 'lucide-react'
import { academyAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import type { ResearchSummaryItem } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

export default function ResearchLibrary() {
  const [items, setItems] = useState<ResearchSummaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<number | null>(null)

  useEffect(() => {
    academyAPI.getResearch()
      .then((res) => setItems(parseListResponse(res.data)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Research Library"
        description="Plain-language summaries of general sports-science knowledge — written to be accurate, not to overstate certainty"
      />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={28} /></div>
      ) : items.length === 0 ? (
        <Card><EmptyState icon={BookOpen} title="No entries yet" description="More topics are added regularly." /></Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isOpen = openId === item.id
            return (
              <Card key={item.id} className="overflow-hidden">
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <div>
                    {item.topic_name && (
                      <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-accent">{item.topic_name}</p>
                    )}
                    <h3 className="mt-1 font-display text-base font-bold text-text">{item.title}</h3>
                    {item.last_reviewed && (
                      <p className="mt-1 flex items-center gap-1.5 font-body text-[11px] text-text-muted">
                        <CalendarCheck size={12} /> Last reviewed {new Date(item.last_reviewed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <ChevronDown size={18} className={cn('shrink-0 text-text-muted transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="border-t border-border px-6 py-6">
                    <p className="font-body text-sm leading-relaxed text-text-secondary">{item.summary}</p>
                    {item.practical_takeaways && (
                      <div className="mt-4 rounded-xl bg-accent-soft p-4">
                        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-accent">Practical Takeaways</p>
                        <p className="mt-2 font-body text-sm text-text-secondary">{item.practical_takeaways}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
