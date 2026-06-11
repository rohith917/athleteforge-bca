/**
 * MDNT-style infinite horizontal marquee
 */
export default function MarqueeBand({ items, duration = 28, accent = false, reverse = false }) {
  const list = items?.length ? items : ['AthleteForge']
  const doubled = [...list, ...list]

  return (
    <div className={`mdnt-marquee-wrap${accent ? ' accent' : ''}`} aria-hidden="true">
      <div
        className={`mdnt-marquee-track${reverse ? ' reverse' : ''}`}
        style={{ '--marquee-duration': `${duration}s` }}
      >
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="mdnt-marquee-item">
            {item}
            <span className="sep">/</span>
          </span>
        ))}
      </div>
    </div>
  )
}