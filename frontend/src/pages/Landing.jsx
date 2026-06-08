/**
 * AthleteForge — Premium enterprise landing page
 */
import { Link } from 'react-router-dom'
import {
  FaUsers, FaChartLine, FaBandAid, FaHeartbeat, FaTrophy, FaClipboardCheck,
  FaWeight, FaBrain, FaDumbbell, FaArrowRight, FaBolt
} from 'react-icons/fa'
import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'
import DashboardPreview from '../components/analytics/DashboardPreview'
import AnimatedCounter from '../components/ui/AnimatedCounter'

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
  return (
    <div className="landing-page landing-premium">
      <PublicNavbar />

      <section className="landing-hero-premium">
        <div className="container position-relative">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-6 landing-hero-text order-1">
              <span className="landing-eyebrow">Elite Sports Performance Platform</span>
              <h1 className="landing-headline-premium">
                Track. Recover.<br />
                <span className="gold">Perform. Win.</span>
              </h1>
              <p className="landing-sub-premium">
                AthleteForge is a professional athlete performance, recovery, injury management,
                and analytics platform built for coaches, sports academies, and athletes.
              </p>
              <div className="landing-cta-group">
                <Link to="/register" className="btn-gold btn-landing-primary">
                  Get Started <FaArrowRight />
                </Link>
                <Link to="/login" className="btn-outline-gold">View Dashboard</Link>
              </div>
            </div>
            <div className="col-12 col-lg-6 order-2">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section-premium">
        <div className="container">
          <div className="stats-grid-premium">
            {platformStats.map((s) => (
              <div className="stat-block-premium animate-in" key={s.label}>
                <span className="num"><AnimatedCounter value={s.value} suffix={s.suffix} /></span>
                <span className="lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="container">
          <h2 className="landing-section-title">Enterprise Sports Intelligence</h2>
          <p className="landing-section-sub">Everything elite teams need — in one premium platform.</p>
          <div className="feature-grid-premium">
            {features.map((f, i) => (
              <div className="feature-card-premium animate-in" style={{ animationDelay: `${i * 50}ms` }} key={f.title}>
                <div className="icon"><f.icon /></div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="container text-center">
          <h2 className="landing-section-title mb-3">Built for Elite Performance</h2>
          <p className="landing-section-sub mb-4">
            Trusted by coaches, academies, and athletes pursuing Olympic-level excellence.
          </p>
          <div className="landing-cta-group justify-content-center">
            <Link to="/register" className="btn-gold btn-landing-primary">Get Started</Link>
            <Link to="/login" className="btn-outline-gold">Sign In</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}