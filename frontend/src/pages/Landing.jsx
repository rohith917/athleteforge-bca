/**
 * AthleteForge — Cinematic landing (Dribbble-style sports SaaS)
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaUsers, FaChartLine, FaBandAid, FaHeartbeat, FaDumbbell,
  FaClipboardCheck, FaTrophy, FaBolt, FaArrowRight, FaBrain,
  FaExclamationTriangle, FaClock, FaMedal
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import PublicLayout from '../components/PublicLayout'
import PublicFooter from '../components/PublicFooter'
import HeroShowcase from '../components/landing/HeroShowcase'

const features = [
  { icon: FaUsers, title: 'Athlete Management', desc: 'Centralized roster, profiles, and team intelligence.', color: '#8b5cf6' },
  { icon: FaChartLine, title: 'Performance Analytics', desc: 'Speed, power, endurance trends with live charts.', color: '#3b82f6' },
  { icon: FaBandAid, title: 'Injury Tracking', desc: 'Log injuries, severity, and return-to-play workflows.', color: '#ef4444' },
  { icon: FaHeartbeat, title: 'Recovery Monitoring', desc: 'Recovery scores and readiness before competition.', color: '#22c55e' },
  { icon: FaDumbbell, title: 'Training Load', desc: 'Session load with acute vs chronic analysis.', color: '#f59e0b' },
  { icon: FaClipboardCheck, title: 'Attendance', desc: 'Session compliance with coach reporting.', color: '#06b6d4' },
  { icon: FaTrophy, title: 'Competitions', desc: 'Events, medals, and win-rate analytics.', color: '#d4af37' },
  { icon: FaBrain, title: 'AI Insights', desc: 'Smart alerts for injury risk and performance dips.', color: '#a78bfa' },
]

const problems = [
  {
    icon: FaExclamationTriangle,
    title: 'Injuries go untracked',
    desc: 'Paper logs and WhatsApp messages lose critical recovery data. AthleteForge centralizes injury history with severity and rehab status.',
    img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: FaClock,
    title: 'No real-time performance view',
    desc: 'Coaches cannot spot fatigue or progress trends before match day. Live dashboards show speed, strength, and attendance patterns.',
    img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: FaMedal,
    title: 'Competition prep is guesswork',
    desc: 'Selectors need data-backed readiness reports. Export PDF/Excel reports and AI insights for every athlete.',
    img: 'https://images.unsplash.com/photo-1517649763961-0c62306601b7?auto=format&fit=crop&w=600&q=80',
  },
]

const gallery = [
  { sport: 'Track & Field', img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80' },
  { sport: 'Football', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80' },
  { sport: 'Swimming', img: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Landing() {
  const { user, authChecked } = useAuth()
  const isAuthenticated = Boolean(authChecked && user)

  return (
    <PublicLayout>
      <div className="landing-premium">

        {/* Cinematic Hero */}
        <section className="hero-cinematic">
          <div className="hero-cinematic-bg" aria-hidden="true" />
          <div className="hero-cinematic-overlay" aria-hidden="true" />
          <div className="hero-cinematic-glow" aria-hidden="true" />
          <div className="container hero-cinematic-content">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                  <span className="hero-brand-line">Elite Sports Performance Platform</span>
                  <h1 className="hero-title-dribbble">
                    <span className="gradient-text">ATHLETE</span>
                    <span className="gold">FORGE</span>
                  </h1>
                  <p className="hero-tagline-dribbble">TRACK · RECOVER · PERFORM</p>
                  <p className="hero-desc-dribbble">
                    The all-in-one platform for coaches and athletes — injury tracking,
                    performance analytics, attendance, AI insights, and competition readiness.
                  </p>
                  <div className="hero-cta-dribbble">
                    {isAuthenticated ? (
                      <Link to="/dashboard" className="btn-hero-primary">
                        Go to Dashboard <FaArrowRight />
                      </Link>
                    ) : (
                      <>
                        <Link to="/register" className="btn-hero-primary">
                          Start Free <FaArrowRight />
                        </Link>
                        <Link to="/login" className="btn-hero-ghost">Sign In</Link>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
              <div className="col-lg-6">
                <motion.div
                  className="hero-preview-wrap"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <HeroShowcase />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats band */}
        <section className="stats-band-dribbble">
          <div className="container">
            <div className="row g-4">
              {[
                { num: '500+', lbl: 'Athletes Tracked' },
                { num: '95%', lbl: 'Recovery Rate' },
                { num: '50+', lbl: 'Teams & Academies' },
                { num: '24/7', lbl: 'Live Analytics' },
              ].map((s, i) => (
                <motion.div
                  key={s.lbl}
                  className="col-6 col-md-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="stat-item-dribbble">
                    <span className="num">{s.num}</span>
                    <span className="lbl">{s.lbl}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Problems we solve */}
        <section className="problems-section">
          <div className="container">
            <span className="section-eyebrow">Why AthleteForge?</span>
            <h2 className="section-title-dribbble">Real problems. Real solutions.</h2>
            <p className="section-sub-dribbble">
              Not just another form — AthleteForge solves the daily pain points coaches and athletes face.
            </p>
            <div className="row g-4">
              {problems.map((p, i) => (
                <motion.div
                  key={p.title}
                  className="col-md-4"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  <div className="problem-card">
                    <div className="problem-card-img-wrap">
                      <img src={p.img} alt={p.title} className="problem-card-img" />
                      <div className="problem-card-img-overlay" />
                    </div>
                    <div className="problem-card-body">
                      <div className="problem-card-icon"><p.icon /></div>
                      <h4>{p.title}</h4>
                      <p>{p.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="features-dribbble">
          <div className="container">
            <span className="section-eyebrow">Platform Features</span>
            <h2 className="section-title-dribbble">Everything your team needs</h2>
            <p className="section-sub-dribbble">
              Eight powerful modules — built for coaches, academies, and elite athletes.
            </p>
            <div className="row g-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="col-sm-6 col-lg-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                >
                  <div className="feature-card-dribbble">
                    <div className="feature-icon-dribbble" style={{ color: f.color }}>
                      <f.icon />
                    </div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sport gallery */}
        <section className="gallery-section">
          <div className="container">
            <span className="section-eyebrow">Built for every sport</span>
            <h2 className="section-title-dribbble">Train. Compete. Win.</h2>
            <div className="row g-4">
              {gallery.map((g, i) => (
                <motion.div
                  key={g.sport}
                  className="col-md-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="gallery-card">
                    <img src={g.img} alt={g.sport} />
                    <div className="gallery-card-label">{g.sport}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-dribbble">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title-dribbble">Ready to forge elite performance?</h2>
              <p className="section-sub-dribbble">
                Join coaches and athletes using AthleteForge for smarter training decisions.
              </p>
              <div className="hero-cta-dribbble justify-content-center">
                <Link to="/register" className="btn-hero-primary">
                  Create Free Account <FaBolt />
                </Link>
                <Link to="/login" className="btn-hero-ghost">Sign In</Link>
              </div>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </PublicLayout>
  )
}