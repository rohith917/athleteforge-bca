/**
 * AthleteForge Landing Page — hero, features, CTA.
 */
import { Link } from 'react-router-dom'
import {
  FaChartLine, FaBandAid, FaUsers, FaTrophy, FaBrain,
  FaClipboardCheck, FaArrowRight
} from 'react-icons/fa'
import PublicNavbar from '../components/PublicNavbar'
import PublicFooter from '../components/PublicFooter'
import Logo from '../components/Logo'

const features = [
  { icon: FaUsers, title: 'Athlete Management', desc: 'Complete profiles, photos, and team organization.' },
  { icon: FaChartLine, title: 'Performance Tracking', desc: 'Speed, strength, endurance, flexibility & agility scores.' },
  { icon: FaBandAid, title: 'Injury Recovery', desc: 'Track injuries, recovery status, and medical notes.' },
  { icon: FaTrophy, title: 'Competitions', desc: 'Events, results, and medal tracking.' },
  { icon: FaClipboardCheck, title: 'Attendance', desc: 'Training session records and attendance reports.' },
  { icon: FaBrain, title: 'AI Insights', desc: 'Smart performance suggestions and injury risk alerts.' },
]

const roles = [
  { title: 'Coaches & Admins', desc: 'Full control — manage athletes, data, reports & users.', badge: 'Full Access' },
  { title: 'Students & Athletes', desc: 'View your profile, performance, injuries & attendance.', badge: 'Personal Portal' },
]

export default function Landing() {
  return (
    <div className="landing-page">
      <PublicNavbar />

      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="container landing-hero-content animate-in">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-7 landing-hero-text order-1">
              <h1 className="landing-headline">
                Train Smarter.<br />
                <span className="gold-text">Recover Faster.</span><br />
                Perform Better.
              </h1>
              <p className="landing-lead">
                <strong>AthleteForge</strong> is a professional athlete performance and injury
                tracking platform built for coaches, admins, and student athletes.
              </p>
              <p className="landing-tagline">Track. Recover. Perform.</p>
              <div className="landing-cta-group">
                <Link to="/login" className="btn-gold btn-landing-primary">
                  Sign In <FaArrowRight />
                </Link>
                <Link to="/register" className="btn-outline-gold">
                  Create Free Account
                </Link>
              </div>
            </div>
            <div className="col-12 col-lg-5 order-2">
              <div className="landing-hero-card">
                <Logo size="lg" showTagline />
                <div className="landing-stats-row">
                  <div className="landing-stat">
                    <span className="val">5+</span>
                    <span className="lbl">Metrics</span>
                  </div>
                  <div className="landing-stat">
                    <span className="val">AI</span>
                    <span className="lbl">Insights</span>
                  </div>
                  <div className="landing-stat">
                    <span className="val">24/7</span>
                    <span className="lbl">Access</span>
                  </div>
                </div>
                <p className="landing-hero-note">
                  Role-based dashboards for coaches, admins, and athletes — secure and professional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="container">
          <h2 className="landing-section-title">Everything You Need</h2>
          <p className="landing-section-sub">A complete sports management system in one elegant platform.</p>
          <div className="row g-4">
            {features.map((f, i) => (
              <div className="col-md-6 col-lg-4" key={f.title}>
                <div className="landing-feature-card animate-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="landing-feature-icon"><f.icon /></div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-dark">
        <div className="container">
          <h2 className="landing-section-title">Built for Every Role</h2>
          <div className="row g-4 justify-content-center">
            {roles.map(r => (
              <div className="col-md-5" key={r.title}>
                <div className="landing-role-card">
                  <span className="landing-role-badge">{r.badge}</span>
                  <h4>{r.title}</h4>
                  <p>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="container text-center">
          <h2 className="landing-section-title mb-3">Ready to Get Started?</h2>
          <p className="landing-section-sub mb-4">Sign in with your credentials or register as Coach or Student.</p>
          <div className="landing-cta-group justify-content-center">
            <Link to="/login" className="btn-gold btn-landing-primary">Sign In Now</Link>
            <Link to="/register" className="btn-outline-gold">Register</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}