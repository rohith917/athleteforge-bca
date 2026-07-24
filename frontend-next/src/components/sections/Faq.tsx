import { useRef, useState } from 'react'
import gsap from 'gsap'
import { Plus } from 'lucide-react'
import { SplitText } from '@/components/motion/SplitText'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: 'How does the AI readiness score actually work?',
    a: 'It fuses your athletes’ recent performance trends, injury history, and attendance into a single 0-100 score, recomputed after every new data point. Coaches see the factors behind the number, not just the number itself.',
  },
  {
    q: 'Can students, coaches, and admins all use the same platform?',
    a: 'Yes — AthleteForge is role-based from the ground up. Students see their own performance and recovery data, coaches manage rosters and injuries, and admins get full platform oversight and user management.',
  },
  {
    q: 'Does AthleteForge replace our physiotherapist or medical staff?',
    a: 'No. It gives your medical and coaching staff a single source of truth for injury history and recovery timelines — the clinical decisions stay entirely with your qualified staff.',
  },
  {
    q: 'What happens to our data if we stop using the platform?',
    a: 'You can export every athlete record, performance log, and report as PDF or Excel at any time. Your data is never locked in.',
  },
  {
    q: 'Is there a free tier for academic or student projects?',
    a: 'Yes — the Academy tier is free for BCA and academic programs, covering up to 25 athletes with full performance and injury tracking.',
  },
]

function FaqItem({ item, isOpen, onToggle }: { item: (typeof FAQS)[number]; isOpen: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    const content = contentRef.current
    const icon = iconRef.current
    if (!content) return
    if (!isOpen) {
      gsap.set(content, { height: 'auto' })
      gsap.from(content, { height: 0, duration: 0.5, ease: 'power3.inOut' })
      gsap.to(icon, { rotate: 45, duration: 0.3 })
    } else {
      gsap.to(content, { height: 0, duration: 0.4, ease: 'power3.inOut' })
      gsap.to(icon, { rotate: 0, duration: 0.3 })
    }
    onToggle()
  }

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-6 py-7 text-left"
        data-cursor-hover=""
      >
        <span className="font-display text-lg font-semibold text-text sm:text-xl">{item.q}</span>
        <div ref={iconRef} className="shrink-0 text-accent">
          <Plus size={22} />
        </div>
      </button>
      <div ref={contentRef} className={cn('overflow-hidden', !isOpen && 'h-0')}>
        <p className="max-w-3xl pb-7 font-body leading-relaxed text-text-secondary">{item.a}</p>
      </div>
    </div>
  )
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative border-t border-border bg-background-secondary px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            FAQ
          </span>
          <SplitText
            as="h2"
            splitBy="lines"
            className="mt-6 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text sm:text-5xl"
          >
            Questions, answered directly.
          </SplitText>
        </div>

        <div className="mt-16">
          {FAQS.map((item, i) => (
            <FaqItem
              key={item.q}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((prev) => (prev === i ? null : i))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
