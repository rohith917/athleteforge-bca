/**
 * Up Digital–inspired landing sections (lime, stats, flip cards, meet AI)
 */
import { Link } from 'react-router-dom'
import { FaArrowRight, FaBrain } from 'react-icons/fa'
import SafeImage from '../SafeImage'
import { LOCAL_IMAGES, LOCAL_SVG } from '../../utils/mediaUrls'

const TRUSTED = [
  'BCA Athletics', 'Sprint Academy', 'Elite FC', 'Aqua Performance',
  'National Sports Board', 'State Championships', 'Olympic Prep', 'Youth Academy',
]

const STATS = [
  { category: 'Athletes', value: '500+', label: 'Tracked', sub: 'Across all sports' },
  { category: 'Recovery', value: '95%', label: 'Success Rate', sub: 'Return-to-play' },
  { category: 'AI Insights', value: '24/7', label: 'Live Analysis', sub: 'Always on' },
  { category: 'Teams', value: '50+', label: 'Academies', sub: 'Coaches & squads' },
  { category: 'Attendance', value: '94%', label: 'Avg Compliance', sub: '60-day window' },
]

const SERVICES = [
  { num: '01', title: 'Performance AI', desc: 'Deep metric analysis across speed, strength, endurance, flexibility & agility with trend forecasting.', link: '/register', img: LOCAL_IMAGES.servicePerformance, fallback: LOCAL_SVG.athlete },
  { num: '02', title: 'Injury Engine', desc: 'Risk scoring, injury history, prevention protocols, and smart recovery timelines — before injuries happen.', link: '/register', img: LOCAL_IMAGES.serviceInjury, fallback: LOCAL_SVG.coach },
  { num: '03', title: 'Readiness Orb', desc: 'Live fusion score combining performance, attendance, and injury safety into one competition-ready number.', link: '/register', img: LOCAL_IMAGES.serviceReadiness, fallback: LOCAL_SVG.track },
  { num: '04', title: 'Voice Coach', desc: 'Web Speech-powered coaching briefs — hear your full AI analysis and weekly plan aloud.', link: '/register', img: LOCAL_IMAGES.serviceVoice, fallback: LOCAL_SVG.coach },
  { num: '05', title: 'AI Copilot', desc: 'Chat or speak naturally. Ask about readiness, training plans, injuries, medals — get instant deep answers.', link: '/register', img: LOCAL_IMAGES.serviceCopilot, fallback: LOCAL_SVG.track },
  { num: '06', title: 'Team Reports', desc: 'PDF & Excel exports, admin dashboards, role-based access for coaches, athletes, and selectors.', link: '/register', img: LOCAL_IMAGES.serviceReports, fallback: LOCAL_SVG.football },
]

const DIFF = [
  { stat: 'AI-FIRST', title: 'AI Powers Every Module', desc: 'Not a bolt-on — intelligence runs through performance, injury, and attendance.' },
  { stat: '24/7', title: 'Always-On Copilot', desc: 'Your AI coach never sleeps. Voice, chat, and live readiness around the clock.' },
  { stat: '18+', title: 'Data Points Fused', desc: 'Readiness, metrics, injuries, weight, competition, attendance — one brain.' },
  { stat: '3×', title: 'Faster Decisions', desc: 'Coaches spot fatigue and progress trends weeks earlier than spreadsheet tracking.' },
]

export function UpdTrustedMarquee() {
  const doubled = [...TRUSTED, ...TRUSTED]
  return (
    <div className="upd-trusted-wrap">
      <div className="upd-trusted-label">Trusted by academies &amp; teams</div>
      <div className="upd-trusted-track" aria-hidden="true">
        {doubled.map((name, i) => (
          <span key={`${name}-${i}`} className="upd-trusted-item">
            {name}<span className="star">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function UpdStatsDelivered() {
  return (
    <section className="upd-stats-section">
      <div className="upd-stats-banner">
        <SafeImage
          src={LOCAL_IMAGES.statsBanner}
          fallback={LOCAL_SVG.track}
          alt="Athletes training on track"
          className="upd-stats-banner-img"
        />
        <div className="upd-stats-banner-overlay" />
        <div className="upd-stats-banner-caption">
          <span>Real training environments</span>
          <strong>Data-backed performance</strong>
        </div>
      </div>
      <div className="upd-stats-header">
        <span className="eyebrow">Real Results</span>
        <h2>What we&apos;ve delivered.</h2>
      </div>
      <div className="upd-stats-grid">
        {STATS.map(s => (
          <div key={s.label} className="upd-stat-card">
            <div className="category">{s.category}</div>
            <div className="value">{s.value}</div>
            <div className="label">{s.label}</div>
            <div className="sub">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function UpdFlipServices() {
  return (
    <section className="upd-services-section">
      <div className="upd-services-header">
        <span className="mdnt-section-label">What we do</span>
        <h2>Platform services</h2>
        <p>Hover any card to reveal details — click to get started.</p>
      </div>
      <div className="upd-flip-grid">
        {SERVICES.map(s => (
          <div key={s.num} className="upd-flip-card">
            <div className="upd-flip-inner">
              <div className="upd-flip-front">
                <SafeImage src={s.img} fallback={s.fallback} alt={s.title} className="upd-flip-bg" />
                <div className="upd-flip-front-content">
                  <span className="upd-flip-num">{s.num}</span>
                  <h3>{s.title}</h3>
                  <span className="upd-flip-hint">Hover to flip</span>
                </div>
              </div>
              <div className="upd-flip-back">
                <p>{s.desc}</p>
                <Link to={s.link}>Explore <FaArrowRight /></Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="upd-diff-grid">
        {DIFF.map(d => (
          <div key={d.title} className="upd-diff-card">
            <div className="upd-diff-stat">{d.stat}</div>
            <h4>{d.title}</h4>
            <p>{d.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function UpdMeetAI() {
  return (
    <section className="upd-meet-ai">
      <div className="upd-meet-ai-inner">
        <div className="upd-ai-avatar-wrap">
          <div className="upd-ai-photo-frame">
            <SafeImage
              src={LOCAL_IMAGES.meetAi}
              fallback={LOCAL_SVG.athlete}
              alt="AI coach analyzing athlete performance"
              className="upd-ai-photo"
            />
            <div className="upd-ai-photo-overlay" />
            <div className="upd-ai-avatar-badge" aria-hidden="true"><FaBrain /></div>
          </div>
          <div className="upd-ai-live">
            <span className="live-dot" />
            Live Now
          </div>
        </div>
        <div className="upd-meet-ai-content">
          <span className="eyebrow">Live Now</span>
          <h2>
            Daily AI guidance<br />
            <span className="lime">for training decisions</span><br />
            and recovery.
          </h2>
          <div className="upd-ai-chat-bubble">
            <strong>AI Copilot</strong>
            Ask about today’s agenda, whether to train, specific benchmarks to record, meal ideas, or how to recover faster. Data-driven answers for coaches and athletes.
          </div>
          <p style={{ color: 'var(--mdnt-muted)', marginBottom: 28, lineHeight: 1.7 }}>
            Available 24/7. Trained on athlete performance science. Get instant strategy for
            readiness, injury prevention, training load, and competition prep.
            {' '}Optional <strong>free AI</strong> (Groq or Gemini) powers natural-language answers
            on top of Forge&apos;s analytics — try the floating copilot on this page.
          </p>
          <Link to="/register" className="btn-upd-lime">
            Launch Forge AI <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}