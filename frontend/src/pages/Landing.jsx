/**
 * AthleteForge — MDNT Events–inspired landing (~90% color/UI/UX match)
 * + advanced AI Copilot, live readiness orb, voice input
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaArrowRight, FaBrain, FaMicrophone, FaRobot, FaWaveSquare,
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import PublicLayout from '../components/PublicLayout'
import PublicFooter from '../components/PublicFooter'
import MarqueeBand from '../components/landing/MarqueeBand'
import LiveReadinessOrb from '../components/landing/LiveReadinessOrb'
import AICopilotWidget from '../components/landing/AICopilotWidget'
import {
  UpdTrustedMarquee, UpdStatsDelivered, UpdFlipServices, UpdMeetAI,
} from '../components/landing/UpdLandingSections'
import SafeImage from '../components/SafeImage'
import { REMOTE_IMAGES, LOCAL_IMAGES } from '../utils/mediaUrls'

const caseStudies = [
  {
    tag: 'Track & Field',
    title: 'Sprint Academy',
    metric: '40%',
    metricLabel: 'less downtime',
    desc: 'Reduced injury downtime 40% with centralized recovery tracking.',
    img: REMOTE_IMAGES.track,
    fallback: LOCAL_IMAGES.track,
  },
  {
    tag: 'Football',
    title: 'Elite FC',
    metric: '32',
    metricLabel: 'athletes live',
    desc: 'Live readiness reports for 32 athletes before every match week.',
    img: REMOTE_IMAGES.football,
    fallback: LOCAL_IMAGES.football,
  },
  {
    tag: 'Swimming',
    title: 'Aqua Performance',
    metric: '2wk',
    metricLabel: 'early alert',
    desc: 'AI flagged overtraining 2 weeks before regional championships.',
    img: REMOTE_IMAGES.swim,
    fallback: LOCAL_IMAGES.swim,
  },
]

const gallery = [
  { sport: 'Track', year: '2025', img: REMOTE_IMAGES.galleryTrack, fallback: LOCAL_IMAGES.track },
  { sport: 'Football', year: '2024', img: REMOTE_IMAGES.galleryFootball, fallback: LOCAL_IMAGES.football },
  { sport: 'Swimming', year: '2025', img: REMOTE_IMAGES.gallerySwim, fallback: LOCAL_IMAGES.swim },
  { sport: 'Basketball', year: '2024', img: REMOTE_IMAGES.basketball, fallback: LOCAL_IMAGES.basketball },
  { sport: 'Cricket', year: '2025', img: REMOTE_IMAGES.cricket, fallback: LOCAL_IMAGES.cricket },
]

const aiFeatures = [
  { icon: FaBrain, title: 'AI Readiness Copilot', desc: 'Chat or speak to get instant injury risk and performance guidance.' },
  { icon: FaWaveSquare, title: 'Live Readiness Orb', desc: 'Real-time fusion score that pulses as your data updates.' },
  { icon: FaMicrophone, title: 'Voice Coach Tips', desc: 'Web Speech API reads personalized training advice aloud.' },
  { icon: FaRobot, title: 'Predictive Risk Engine', desc: 'Rule-based ML alerts before fatigue becomes injury.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Landing() {
  const { user, authChecked } = useAuth()
  const isAuthenticated = Boolean(authChecked && user)

  return (
    <PublicLayout mdnt>
      <div className="landing-mdnt">
        {/* Hero — MDNT editorial full-bleed */}
        <section className="mdnt-hero">
          <div className="mdnt-hero-bg" aria-hidden="true" />
          <div className="mdnt-hero-overlay" aria-hidden="true" />
          <div className="mdnt-hero-mesh" aria-hidden="true" />
          <motion.div
            className="mdnt-hero-content"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <div className="upd-hero-locations">
              <span className="dot" />
              BCA · AI-First · Performance Platform
            </div>
            <span className="upd-badge-ai">AI-First Sports Tech</span>
            <h1 className="upd-hero-stack">
              <span className="line line-dim">We bring</span>
              <span className="line line-lime">performance</span>
              <span className="line">to athletes.</span>
            </h1>
            <p className="mdnt-hero-desc">
              We don&apos;t just track stats — we redefine how teams train. AI strategies.
              Licensed coaches. Real readiness results.
            </p>
            <div className="mdnt-hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-upd-lime">
                  Go to Dashboard <FaArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-upd-lime">
                    Start Your Project <FaArrowRight />
                  </Link>
                  <Link to="/login" className="btn-mdnt-outline">Sign In</Link>
                </>
              )}
            </div>
          </motion.div>
        </section>

        <MarqueeBand items={['For Coaches', 'For Athletes', 'AI Powered']} duration={24} />

        <UpdTrustedMarquee />

        {/* Split — For Coaches */}
        <section className="mdnt-split">
          <div className="mdnt-split-visual">
            <SafeImage
              src={REMOTE_IMAGES.coach}
              fallback={LOCAL_IMAGES.coach}
              alt="Coach reviewing athlete performance"
            />
            <div className="mdnt-split-visual-overlay" />
          </div>
          <motion.div
            className="mdnt-split-content"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mdnt-section-label">For Coaches</span>
            <h2 className="mdnt-split-title">Command center you can count on</h2>
            <p className="mdnt-split-desc">
              From roster management, injury workflows, and attendance compliance to sponsor-ready
              PDF reports — we handle the unseen so coaches can focus on winning.
            </p>
            <Link to="/register" className="mdnt-link-arrow">
              Learn more <FaArrowRight />
            </Link>
          </motion.div>
        </section>

        <MarqueeBand items={['Track', 'Recover', 'Perform', 'Win']} duration={20} reverse accent />

        {/* Split — For Athletes (reversed) */}
        <section className="mdnt-split" style={{ direction: 'rtl' }}>
          <div className="mdnt-split-visual" style={{ direction: 'ltr' }}>
            <SafeImage
              src={REMOTE_IMAGES.athlete}
              fallback={LOCAL_IMAGES.athlete}
              alt="Athlete training"
            />
            <div className="mdnt-split-visual-overlay" />
          </div>
          <motion.div
            className="mdnt-split-content cream"
            style={{ direction: 'ltr' }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mdnt-section-label">For Athletes</span>
            <h2 className="mdnt-split-title">Your performance, amplified</h2>
            <p className="mdnt-split-desc">
              Personal dashboards, recovery scores, training tips, and AI insights —
              everything you need to show up competition-ready every single day.
            </p>
            <Link to="/register" className="mdnt-link-arrow">
              Start free <FaArrowRight />
            </Link>
          </motion.div>
        </section>

        {/* AI tech strip */}
        <section className="mdnt-ai-strip">
          <div className="mdnt-ai-strip-inner">
            <div>
              <span className="mdnt-section-label">Next-Gen Technology</span>
              <h2>AI that thinks like your sports scientist</h2>
              <p style={{ color: 'var(--mdnt-muted)', lineHeight: 1.7, maxWidth: '42ch' }}>
                Not a chatbot gimmick — AthleteForge fuses performance trends, injury history,
                and attendance into actionable intelligence. Try the floating copilot below.
              </p>
              <div className="mdnt-ai-features" style={{ marginTop: 32 }}>
                {aiFeatures.map((f, i) => (
                  <motion.div
                    key={f.title}
                    className="mdnt-ai-feature"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                  >
                    <div className="mdnt-ai-feature-icon"><f.icon /></div>
                    <div>
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <LiveReadinessOrb initialScore={78} />
            </motion.div>
          </div>
        </section>

        <MarqueeBand items={['AI Insights', 'Injury Tracking', 'Live Analytics']} duration={26} />

        <UpdFlipServices />

        <UpdStatsDelivered />

        {/* Case studies / work grid */}
        <section className="mdnt-work-section">
          <div className="mdnt-work-header">
            <div>
              <span className="mdnt-section-label">View Projects</span>
              <h2>From academies to elite squads.</h2>
            </div>
            <p>We turn athlete data into moments coaches and selectors actually talk about.</p>
          </div>
          <div className="mdnt-work-grid">
            {caseStudies.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link to="/register" className="mdnt-work-card">
                  <div className="mdnt-work-card-metric">
                    {c.metric}
                    <small>{c.metricLabel}</small>
                  </div>
                  <SafeImage src={c.img} fallback={c.fallback} alt={c.title} />
                  <div className="mdnt-work-card-overlay">
                    <span className="mdnt-work-card-tag">{c.tag}</span>
                    <h3>{c.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/register" className="btn-mdnt-outline">
              View All Features <FaArrowRight />
            </Link>
          </div>
        </section>

        <MarqueeBand items={['Follow Progress', 'Track Recovery', 'Compete']} duration={22} reverse />

        {/* Gallery — Instagram-style */}
        <section className="mdnt-gallery-section">
          <div className="mdnt-gallery-header">
            <span className="mdnt-section-label">Built for every sport</span>
            <h2>Enter the world we create after dark.</h2>
            <p style={{ color: 'var(--mdnt-muted)', maxWidth: '48ch' }}>
              Real training environments — track, field, pool, court. AthleteForge powers them all.
            </p>
          </div>
          <div className="mdnt-gallery-grid">
            {gallery.map(g => (
              <div key={g.sport} className="mdnt-gallery-item">
                <SafeImage src={g.img} fallback={g.fallback} alt={g.sport} />
                <span className="mdnt-gallery-item-meta">{g.sport} · {g.year}</span>
              </div>
            ))}
          </div>
        </section>

        <UpdMeetAI />

        {/* CTA — Up Digital "Let's build" style */}
        <section className="mdnt-cta-block">
          <h2>Let&apos;s build something.</h2>
          <p>Join coaches and athletes using AthleteForge for smarter, data-backed decisions.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-mdnt-cta">
              Get In Touch <FaArrowRight />
            </Link>
            <Link to="/login" className="btn-mdnt-outline" style={{ borderColor: 'rgba(10,10,10,0.3)', color: 'var(--mdnt-black)' }}>
              Sign In
            </Link>
          </div>
        </section>

        <PublicFooter mdnt />
        <AICopilotWidget mode="demo" />
      </div>
    </PublicLayout>
  )
}