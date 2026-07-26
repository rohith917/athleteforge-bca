import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ParticleField } from '@/components/three/ParticleField'
import { Button } from '@/components/ui/Button'
import { SplitText } from '@/components/motion/SplitText'

interface HeroProps {
  ready: boolean
}

export function Hero({ ready }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ready) return
    const tl = gsap.timeline({ delay: 0.15 })
    tl.fromTo(badgeRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      .fromTo(ctaRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .fromTo(scrollCueRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.2')
  }, [ready])

  useEffect(() => {
    const section = sectionRef.current
    const glow = glowRef.current
    if (!section || !glow) return
    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      gsap.to(glow, { '--gx': `${x}%`, '--gy': `${y}%`, duration: 0.6, ease: 'power2.out' })
    }
    section.addEventListener('mousemove', onMove)
    return () => section.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background noise"
    >
      {/* Mouse-reactive radial spotlight */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: 'radial-gradient(600px circle at var(--gx, 50%) var(--gy, 30%), rgba(177,18,38,0.14), transparent 70%)',
        }}
      />

      <ParticleField />

      {/* Cinematic gradient overlays */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-transparent to-background" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/2 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div ref={badgeRef} className="mb-8 flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-4 py-2 opacity-0 backdrop-blur">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          <span className="font-body text-[11px] font-medium uppercase tracking-[0.25em] text-text-secondary">
            AI-Native Performance Intelligence
          </span>
        </div>

        <h1 className="max-w-5xl font-display text-[13vw] font-extrabold uppercase leading-[0.92] tracking-tighter text-text sm:text-[10vw] lg:text-[7.5rem]">
          <SplitText as="span" className="block" splitBy="chars" trigger="mount" delay={0.3} stagger={0.02}>
            Precision
          </SplitText>
          <SplitText as="span" className="block text-transparent [-webkit-text-stroke:1.5px_#ffffff]" splitBy="chars" trigger="mount" delay={0.55} stagger={0.02}>
            Forged in
          </SplitText>
          <SplitText as="span" className="block text-accent" splitBy="chars" trigger="mount" delay={0.8} stagger={0.02}>
            Data.
          </SplitText>
        </h1>

        <p className="mt-8 max-w-lg font-body text-base text-text-secondary sm:text-lg">
          AthleteForge fuses biometric signal, training load, and recovery science
          into one AI copilot — built for coaches and athletes who refuse to guess.
        </p>

        <div ref={ctaRef} className="mt-12 flex flex-col items-center gap-4 opacity-0 sm:flex-row">
          <Button size="lg" cursorLabel="Enter" onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}>
            Experience the Platform
          </Button>
          <Link to="/register">
            <Button variant="outline" size="lg" magnetic={false}>
              Request Access
            </Button>
          </Link>
        </div>
      </div>

      <div ref={scrollCueRef} className="absolute bottom-10 z-10 flex flex-col items-center gap-3 opacity-0">
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-text-muted">Scroll</span>
        <div className="h-12 w-px overflow-hidden bg-border">
          <div className="h-full w-full animate-scrollcue bg-accent" />
        </div>
      </div>
    </section>
  )
}
