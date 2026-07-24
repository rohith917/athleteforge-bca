import { Move3d } from 'lucide-react'
import { CoreSphere } from '@/components/three/CoreSphere'
import { SplitText } from '@/components/motion/SplitText'

export function CoreShowcase() {
  return (
    <section id="core" className="relative overflow-hidden border-t border-border bg-background py-32">
      <div className="mx-auto max-w-[1600px] px-6 text-center lg:px-12">
        <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          The Engine
        </span>
        <SplitText
          as="h2"
          splitBy="lines"
          className="mx-auto mt-6 max-w-3xl font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text sm:text-5xl"
        >
          One core. Every signal, fused.
        </SplitText>
      </div>

      <div className="relative mx-auto mt-4 h-[70vh] max-w-[1600px] cursor-grab active:cursor-grabbing" data-cursor-hover="Drag">
        <CoreSphere />
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex items-center justify-center gap-2 font-body text-[11px] uppercase tracking-[0.25em] text-text-muted">
          <Move3d size={14} />
          Drag to explore
        </div>
      </div>
    </section>
  )
}
