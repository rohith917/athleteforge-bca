import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Footprints, GraduationCap, Target, Flame, Trophy, Layers, Medal } from 'lucide-react'
import { academyAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import type { Certificate, UserBadgeItem } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Spinner } from '@/components/ui/Spinner'

const BADGE_ICONS: Record<string, typeof Award> = {
  Footprints, GraduationCap, Target, Flame, Trophy, Layers,
}

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [badges, setBadges] = useState<UserBadgeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([academyAPI.getCertificates(), academyAPI.getBadges()])
      .then(([certRes, badgeRes]) => {
        setCertificates(parseListResponse(certRes.data))
        setBadges(parseListResponse(badgeRes.data))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Certificates & Badges" description="Earned automatically as you complete courses, quizzes, and learning streaks" />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 font-body text-xs font-semibold uppercase tracking-widest text-text-muted">Certificates</h3>
            {certificates.length === 0 ? (
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
                    <Link
                      to={`/certificates/${cert.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 font-body text-xs font-semibold text-accent hover:text-accent-hover"
                    >
                      View & Print Certificate
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardHeader><CardTitle>Badges ({badges.length})</CardTitle></CardHeader>
              <div className="p-6">
                {badges.length === 0 ? (
                  <EmptyState icon={Medal} title="No badges yet" description="Complete lessons, ace a quiz, or build a learning streak to start earning badges." />
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {badges.map((ub) => {
                      const Icon = BADGE_ICONS[ub.badge.icon] ?? Medal
                      return (
                        <div key={ub.id} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white/[0.03] p-5 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                            <Icon size={22} />
                          </div>
                          <p className="font-body text-sm font-semibold text-text">{ub.badge.name}</p>
                          <p className="font-body text-xs text-text-muted">{ub.badge.description}</p>
                          <p className="font-body text-[10px] uppercase tracking-widest text-text-muted">
                            {new Date(ub.awarded_at).toLocaleDateString()}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
