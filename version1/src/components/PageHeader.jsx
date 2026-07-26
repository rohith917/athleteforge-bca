/**
 * Page header. Uses the CSS-driven fade-in (same as every other page-level
 * element) instead of a framer-motion mount animation — the JS-timed
 * version could intermittently get stuck at its initial opacity:0 depending
 * on mount/commit timing, leaving the header invisible.
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header page-header-luxury animate-in">
      <div>
        <h2 className="page-heading">{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  )
}