import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import { academyAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import type { Certificate } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Spinner } from '@/components/ui/Spinner'

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    academyAPI.getCertificates()
      .then((res) => setCertificates(parseListResponse(res.data)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="My Certificates" description="Earned automatically on course completion" />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : certificates.length === 0 ? (
        <Card><EmptyState icon={Award} title="No certificates yet" description="Complete a course in the Academy to earn your first one." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="flex flex-col items-center gap-3 p-8 text-center">
              <Award size={32} className="text-accent" />
              <h3 className="font-display text-base font-bold text-text">{cert.course_title}</h3>
              <p className="font-body text-xs text-text-secondary">{cert.user_name}</p>
              <p className="font-body text-[11px] uppercase tracking-widest text-text-muted">
                Issued {new Date(cert.issued_at).toLocaleDateString()}
              </p>
              <p className="mt-2 rounded-full bg-white/5 px-3 py-1 font-body text-[10px] text-text-muted">{cert.certificate_number}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
