import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Award, ArrowLeft, Printer } from 'lucide-react'
import { academyAPI } from '@/services/api'
import type { Certificate } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'

export default function CertificateView() {
  const { id } = useParams<{ id: string }>()
  const [cert, setCert] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    academyAPI.getCertificate(Number(id))
      .then((res) => setCert(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Spinner size={28} /></div>
  }

  if (error || !cert) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
        <p className="font-body text-text-secondary">Certificate not found, or it isn't yours to view.</p>
        <Link to="/dashboard/academy/certificates" className="font-body text-sm text-accent hover:text-accent-hover">
          Back to Certificates
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] px-4 py-10 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between print:hidden">
        <Link to="/dashboard/academy/certificates" className="flex items-center gap-2 font-body text-sm text-text-secondary hover:text-text">
          <ArrowLeft size={16} /> Back to Certificates
        </Link>
        <Button size="sm" magnetic={false} onClick={() => window.print()}>
          <Printer size={15} /> Print / Save as PDF
        </Button>
      </div>

      <div
        className="mx-auto max-w-3xl border-[3px] border-double p-12 text-center print:m-0 print:max-w-none print:border-4"
        style={{
          backgroundColor: '#fbf8f2',
          borderColor: '#c9a24b',
          color: '#1a1a1a',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex justify-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: '#c9a24b1a', color: '#c9a24b' }}
          >
            <Award size={32} />
          </div>
        </div>

        <p className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: '#8a7748' }}>
          AthleteForge Sports Science Academy
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight" style={{ color: '#1a1a1a' }}>
          Certificate of Completion
        </h1>

        <p className="mt-8 font-body text-sm" style={{ color: '#5a5a5a' }}>This certifies that</p>
        <p className="mt-2 font-display text-2xl font-bold" style={{ color: '#1a1a1a' }}>{cert.user_name}</p>

        <p className="mt-6 font-body text-sm" style={{ color: '#5a5a5a' }}>has successfully completed</p>
        <p className="mt-2 font-display text-xl font-bold" style={{ color: '#1a1a1a' }}>{cert.course_title}</p>
        <p className="mt-2 font-body text-xs uppercase tracking-widest" style={{ color: '#8a7748' }}>
          {cert.course_level} level · {cert.course_hours} hours of study
        </p>

        <div className="mx-auto mt-10 h-px w-40" style={{ backgroundColor: '#c9a24b' }} />

        <div className="mt-6 flex items-center justify-center gap-10 font-body text-xs" style={{ color: '#5a5a5a' }}>
          <div>
            <p className="uppercase tracking-widest" style={{ color: '#8a7748' }}>Issued</p>
            <p className="mt-1 font-semibold" style={{ color: '#1a1a1a' }}>
              {new Date(cert.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-widest" style={{ color: '#8a7748' }}>Certificate No.</p>
            <p className="mt-1 font-semibold" style={{ color: '#1a1a1a' }}>{cert.certificate_number}</p>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-center font-body text-[11px] text-text-muted print:hidden">
        Verify this certificate's authenticity by its certificate number with AthleteForge.
      </p>
    </div>
  )
}
