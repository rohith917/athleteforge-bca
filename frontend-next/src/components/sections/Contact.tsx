import { useState, type FormEvent } from 'react'
import { ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react'
import { contactAPI, getErrorMessage, withApiReady } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { SplitText } from '@/components/motion/SplitText'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '' })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')
    try {
      await withApiReady(() => contactAPI.submit(form))
      setStatus('success')
      setForm({ name: '', email: '', organization: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMessage(getErrorMessage(err, 'Could not send your message. Please try again.'))
    }
  }

  return (
    <section id="contact" className="relative border-t border-border bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto grid max-w-[1600px] gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Contact
          </span>
          <SplitText
            as="h2"
            splitBy="lines"
            className="mt-6 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text sm:text-5xl"
          >
            Let's build your edge.
          </SplitText>
          <p className="mt-8 max-w-md font-body leading-relaxed text-text-secondary">
            Tell us about your team, academy, or program. We'll get back to you within one
            business day.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">
                Name
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-3 w-full border-b border-border bg-transparent py-3 font-body text-text outline-none transition-colors focus:border-accent"
                placeholder="Jane Coach"
              />
            </div>
            <div>
              <label htmlFor="email" className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-3 w-full border-b border-border bg-transparent py-3 font-body text-text outline-none transition-colors focus:border-accent"
                placeholder="jane@academy.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="organization" className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">
              Organization <span className="normal-case text-text-muted/60">(optional)</span>
            </label>
            <input
              id="organization"
              value={form.organization}
              onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
              className="mt-3 w-full border-b border-border bg-transparent py-3 font-body text-text outline-none transition-colors focus:border-accent"
              placeholder="Sprint Academy"
            />
          </div>

          <div>
            <label htmlFor="message" className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="mt-3 w-full resize-none border-b border-border bg-transparent py-3 font-body text-text outline-none transition-colors focus:border-accent"
              placeholder="Tell us about your team and what you're looking for..."
            />
          </div>

          {status === 'error' && (
            <p className="font-body text-sm text-accent-hover">{errorMessage}</p>
          )}

          {status === 'success' ? (
            <div className="flex items-center gap-3 rounded-full border border-border-strong bg-surface px-6 py-4 font-body text-sm text-text">
              <CheckCircle2 className="text-accent" size={18} />
              Message sent — we'll be in touch shortly.
            </div>
          ) : (
            <Button type="submit" size="lg" disabled={status === 'submitting'} className="mt-2 w-fit" magnetic={false}>
              {status === 'submitting' ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Sending...
                </>
              ) : (
                <>
                  Send Message <ArrowUpRight size={18} />
                </>
              )}
            </Button>
          )}
        </form>
      </div>
    </section>
  )
}
