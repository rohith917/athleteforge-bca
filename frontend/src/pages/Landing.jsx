/**
 * AthleteForge — Final Dribbble-style landing page
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaUsers, FaChartLine, FaBandAid, FaHeartbeat, FaTrophy, FaClipboardCheck,
  FaWeight, FaBrain, FaDumbbell, FaArrowRight, FaBolt
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'
import DashboardPreview from '../components/analytics/DashboardPreview'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import { fadeUp, staggerContainer } from '../components/motion/Motion'

const features = [
  { icon: FaUsers, title: 'Athlete Management', desc: 'Elite profiles, roster intelligence, and team organization.' },
  { icon: FaChartLine, title: 'Performance Analytics', desc: 'Speed, power, strength, agility, and trend intelligence.' },
  { icon: FaBandAid, title: 'Injury Tracking', desc: 'Clinical-grade injury logging with severity and RTP workflows.' },
  { icon: FaHeartbeat, title: 'Recovery Monitoring', desc: 'Recovery scores, progress bars, and return-to-play timelines.' },
  { icon: FaTrophy, title: 'Competition Tracking', desc: 'Results, medals, rankings, and win-rate analytics.' },
  { icon: FaClipboardCheck, title: 'Attendance Monitoring', desc: 'Session records with compliance and trend reporting.' },
  { icon: FaWeight, title: 'Weight Management', desc: 'BMI, body composition, and combat sports weight-cut progress.' },
  { icon: FaBrain, title: 'Sports Science Insights', desc: 'Evidence-based metrics for high-performance environments.' },
  { icon: FaDumbbell, title: 'Training Load Monitoring', desc: 'Duration × RPE load with acute vs chronic analysis.' },
  { icon: FaBolt, title: 'AI Recommendations', desc: 'Smart alerts for risk, recovery, readiness, and load.' },
]

const platformStats = [
  { value: 120, suffix: '+', label: 'Athletes Managed' },
  { value: 340, suffix: '+', label: 'Injuries Tracked' },
  { value: 85, suffix: '+', label: 'Competitions Recorded' },
  { value: 92, suffix: '%', label: 'Recovery Success Rate' },
  { value: 1500, suffix: '+', label: 'Performance Metrics' },
]

export default function Landing() {
  const { user } = useAuth()
  const dashLink = user ? '/dashboard' : '/login'

  return (
    <div className="landing-page landing-premium">
      <PublicNavbar />

      <section className="hero-cinematic">
        <div className="hero-cinematic-bg" aria-hidden="true" />
        <div className="hero-cinematic-overlay" aria-hidden="true" />
        <div className="hero-cinematic-glow" aria-hidden="true" />

        <div className="container hero-cinematic-content">
          <div className="row align-items-center g-5">
            <motion.div
              className="col-12 col-lg-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span className="hero-brand-line" variants={fadeUp}>
                Elite Sports Performance Platform
              </motion.span>
              <motion.h1 className="hero-title-dribbble" variants={fadeUp} custom={1}>
                AthleteForge
              </motion.h1>
              <motion.p className="hero-tagline-dribbble" variants={fadeUp} custom={2}>
                Track. Recover. Perform.
              </motion.p>
              <motion.p className="hero-desc-dribbble" variants={fadeUp} custom={3}>
                A professional athlete performance, recovery, injury management,
                and analytics platform built for coaches, sports academies, and athletes.
              </motion.p>
              <motion.div className="hero-cta-dribbble" variants={fadeUp} custom={4}>
                <Link to="/register" className="btn-hero-primary">
                  Get Started <FaArrowRight />
                </Link>
                <Link to={dashLink} className="btn-hero-ghost">View Dashboard</Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="col-12 col-lg-6 hero-preview-wrap"
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="stats-band-dribbble">
        <div className="container">
          <motion.div
            className="row g-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {platformStats.map((s, i) => (
              <motion.div className="col-6 col-md" key={s.label} variants={fadeUp} custom={i}>
                <div className="stat-item-dribbble">
                  <span className="num"><AnimatedCounter value={s.value} suffix={s.suffix} /></span>
                  <span className="lbl">{s.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="features-dribbble">
        <div className="container">
          <span className="section-eyebrow">Platform Capabilities</span>
          <h2 className="section-title-dribbble">Enterprise Sports Intelligence</h2>
          <p className="section-sub-dribbble">Everything elite teams need — in one premium platform.</p>

          <motion.div
            className="row g-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {features.map((f, i) => (
              <motion.div className="col-sm-6 col-lg-4" key={f.title} variants={fadeUp} custom={i}>
                <motion.div
                  className="feature-card-dribbble"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="feature-icon-dribbble"><f.icon /></div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="cta-dribbble">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title-dribbble mb-3">Built for Elite Performance</h2>
            <p className="section-sub-dribbble mb-4">
              Trusted by coaches, academies, and athletes pursuing Olympic-level excellence.
            </p>
            <div className="hero-cta-dribbble justify-content-center">
              <Link to="/register" className="btn-hero-primary">Get Started</Link>
              <Link to="/login" className="btn-hero-ghost">Sign In</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}