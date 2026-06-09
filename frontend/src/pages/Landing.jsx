/**
 * AthleteForge — Luxury landing (Apple × Nike × Linear)
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaUsers, FaChartLine, FaBandAid, FaHeartbeat, FaDumbbell,
  FaClipboardCheck, FaTrophy, FaBolt, FaArrowRight
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import PublicLayout from '../components/PublicLayout'
import PublicFooter from '../components/PublicFooter'
import HeroShowcase from '../components/landing/HeroShowcase'

const features = [
  { icon: FaUsers, title: 'Athlete Management', desc: 'Roster intelligence and elite athlete profiles.' },
  { icon: FaChartLine, title: 'Performance Analytics', desc: 'Speed, power, strength, and trend insights.' },
  { icon: FaBandAid, title: 'Injury Tracking', desc: 'Clinical-grade logging with recovery workflows.' },
  { icon: FaHeartbeat, title: 'Recovery Monitoring', desc: 'Scores, progress, and return-to-play timelines.' },
  { icon: FaDumbbell, title: 'Training Load', desc: 'Session load with acute vs chronic analysis.' },
  { icon: FaClipboardCheck, title: 'Attendance', desc: 'Session compliance and trend reporting.' },
  { icon: FaTrophy, title: 'Competition Tracking', desc: 'Results, medals, and win-rate analytics.' },
  { icon: FaBolt, title: 'AI Insights', desc: 'Smart alerts for risk, recovery, and readiness.' },
]

export default function Landing() {
  const { user, initializing } = useAuth()
  const isAuthenticated = Boolean(!initializing && user)

  return (
    <PublicLayout>
    <div className="landing-luxury">

      <section className="hero-split">
        <div className="landing-container hero-split-inner">
          <motion.div
            className="hero-split-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hero-eyebrow">Sports Performance Platform</span>
            <h1 className="hero-headline">
              <span>TRACK.</span>
              <span>RECOVER.</span>
              <span>PERFORM.</span>
            </h1>
            <p className="hero-desc">
              Professional athlete performance, recovery, and analytics —
              built for coaches, academies, and elite athletes.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-gold">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/register" className="btn-gold">Sign Up</Link>
                  <Link to="/login" className="btn-outline-gold">Login</Link>
                </>
              )}
            </div>
            <div className="hero-stats-row">
              <div className="hero-stat"><strong>500+</strong><small>Athletes</small></div>
              <div className="hero-stat"><strong>95%</strong><small>Recovery Rate</small></div>
              <div className="hero-stat"><strong>50+</strong><small>Teams</small></div>
              <div className="hero-stat"><strong>24/7</strong><small>Analytics</small></div>
            </div>
          </motion.div>

          <motion.div
            className="hero-showcase-col"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroShowcase />
          </motion.div>
        </div>
      </section>

      <section className="section-luxury">
        <div className="landing-container">
          <div className="section-intro">
            <h2 className="section-headline">Everything your team needs</h2>
            <p className="section-sub">
              A complete performance intelligence platform — minimal, powerful, and built for professionals.
            </p>
          </div>
          <div className="features-luxury-grid">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="feature-luxury"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <div className="feature-luxury-top">
                  <div className="feature-luxury-icon"><f.icon /></div>
                  <FaArrowRight className="feature-luxury-arrow" />
                </div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-luxury">
        <div className="landing-container cta-luxury-inner">
          <h2 className="section-headline">Built for elite performance</h2>
          <p className="section-sub section-sub-cta">
            Join coaches and athletes using AthleteForge to train smarter.
          </p>
          <div className="hero-actions cta-actions">
            <Link to="/register" className="btn-gold">Create Free Account</Link>
            <Link to="/login" className="btn-outline-gold">Login</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
    </PublicLayout>
  )
}