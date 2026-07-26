export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`.trim()} style={style} />
}

export function KpiSkeletonGrid({ count = 4 }) {
  return (
    <div className="row g-3 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <div className="col-sm-6 col-xl-3" key={i}>
          <Skeleton className="skeleton-kpi" />
        </div>
      ))}
    </div>
  )
}