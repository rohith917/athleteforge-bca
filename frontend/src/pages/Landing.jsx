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
import { LOCAL_IMAGES, LOCAL_SVG } from '../utils/mediaUrls'
import { useTilt3D } from '../hooks/useTilt3D'

function TiltWorkCard({ c }) {
  const { ref, onPointerMove, onPointerLeave } = useTilt3D({ maxTilt: 8 })
  return (
    <Link
      ref={ref}
      to="/register"
      className="mdnt-work-card tilt-card"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
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
  )
}

function TiltGalleryItem({ g }) {
  const { ref, onPointerMove, onPointerLeave } = useTilt3D({ maxTilt: 10 })
  return (
    <div
      ref={ref}
      className="mdnt-gallery-item tilt-card"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <SafeImage src={g.img} fallback={g.fallback} alt={g.sport} />
      <span className="mdnt-gallery-item-meta">{g.sport} · {g.year}</span>
    </div>
  )
}

const caseStudies = [
  {
    tag: 'Track & Field',
    title: 'Sprint Academy',
    metric: '40%',
    metricLabel: 'less downtime',
    desc: 'Reduced injury downtime 40% with centralized recovery tracking.',
    img: LOCAL_IMAGES.track,
    fallback: LOCAL_SVG.track,
  },
  {
    tag: 'Football',
    title: 'Elite FC',
    metric: '32',
    metricLabel: 'athletes live',
    desc: 'Live readiness reports for 32 athletes before every match week.',
    img: LOCAL_IMAGES.football,
    fallback: LOCAL_SVG.football,
  },
  {
    tag: 'Swimming',
    title: 'Aqua Performance',
    metric: '2wk',
    metricLabel: 'early alert',
    desc: 'AI flagged overtraining 2 weeks before regional championships.',
    img: LOCAL_IMAGES.swim,
    fallback: LOCAL_SVG.swim,
  },
]

const gallery = [
  { sport: 'Track', year: '2025', img: LOCAL_IMAGES.galleryTrack, fallback: LOCAL_SVG.track },
  { sport: 'Football', year: '2024', img: LOCAL_IMAGES.galleryFootball, fallback: LOCAL_SVG.football },
  { sport: 'Swimming', year: '2025', img: LOCAL_IMAGES.gallerySwim, fallback: LOCAL_SVG.swim },
  { sport: 'Basketball', year: '2024', img: LOCAL_IMAGES.basketball, fallback: LOCAL_SVG.basketball },
  { sport: 'Cricket', year: '2025', img: LOCAL_IMAGES.cricket, fallback: LOCAL_SVG.cricket },
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
  const aiPhotoTilt = useTilt3D({ maxTilt: 8 })

  return (
    <PublicLayout mdnt>
      <div className="landing-mdnt">
        {/* Hero — light, minimal, bold-type composition */}
        <section className="gear-hero">
          <div className="gear-hero-bg" aria-hidden="true" />
          <motion.div
            className="gear-hero-headline-block"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <h1 className="gear-hero-headline">
              Gear up every season<br />
              every <span className="gear-hero-headline-thin">workout</span>
            </h1>
            <div className="gear-hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-mdnt-cta">
                  Go to Dashboard <FaArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-mdnt-cta">Get Started</Link>
                  <Link to="/login" className="btn-mdnt-outline">Sign In</Link>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            className="gear-hero-photo-wrap"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <SafeImage
              src={LOCAL_IMAGES.hero}
              fallback={LOCAL_SVG.hero}
              alt="Athlete training"
              className="gear-hero-photo"
              loading="eager"
            />

            <motion.div
              className="gear-hero-proof"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <div className="gear-hero-avatars">
                <span className="gear-avatar" style={{ '--avatar-bg': '#ff3d3d' }}>R</span>
                <span className="gear-avatar" style={{ '--avatar-bg': '#5b8a17' }}>A</span>
                <span className="gear-avatar" style={{ '--avatar-bg': '#0a0a0a' }}>S</span>
              </div>
              <p>
                Trusted by coaches and athletes tracking performance, recovery,
                and readiness every single day.
              </p>
            </motion.div>

            <motion.div
              className="gear-hero-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <SafeImage
                src={LOCAL_IMAGES.coach}
                fallback={LOCAL_SVG.coach}
                alt=""
                aria-hidden="true"
                className="gear-hero-card-img"
              />
              <span className="gear-hero-card-play" aria-hidden="true"><FaArrowRight /></span>
              <span className="gear-hero-card-label">AI-First Sports Tech</span>
            </motion.div>
          </motion.div>
        </section>

        <MarqueeBand items={['For Coaches', 'For Athletes', 'AI Powered']} duration={24} />

        <UpdTrustedMarquee />

        {/* Split — For Coaches */}
        <section className="mdnt-split">
          <div className="mdnt-split-visual">
            <SafeImage
              src={LOCAL_IMAGES.coach}
              fallback={LOCAL_SVG.coach}
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
              src={LOCAL_IMAGES.athlete}
              fallback={LOCAL_SVG.athlete}
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
              className="mdnt-ai-strip-visual"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div
                ref={aiPhotoTilt.ref}
                className="mdnt-ai-strip-photo tilt-card"
                onPointerMove={aiPhotoTilt.onPointerMove}
                onPointerLeave={aiPhotoTilt.onPointerLeave}
              >
                <SafeImage
                  src={LOCAL_IMAGES.athlete}
                  fallback={LOCAL_SVG.athlete}
                  alt="Athlete using AI readiness tools"
                />
              </div>
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
                <TiltWorkCard c={c} />
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
              <TiltGalleryItem key={g.sport} g={g} />
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