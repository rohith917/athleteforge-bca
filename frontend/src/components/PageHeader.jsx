/**
 * Consistent page header with title, subtitle, and optional action button.
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h2 className="page-heading">{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  )
}