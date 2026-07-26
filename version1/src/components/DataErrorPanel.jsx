/**
 * Reusable load-error panel — uses existing alert styles (no UI redesign).
 */
export default function DataErrorPanel({ message, onRetry, retryLabel = 'Retry', extraAction }) {
  if (!message) return null
  return (
    <div className="alert-custom alert-danger-custom admin-session-alert">
      {message}
      <div className="mt-3 d-flex flex-wrap gap-2">
        {onRetry && (
          <button type="button" className="btn-gold" onClick={onRetry}>
            {retryLabel}
          </button>
        )}
        {extraAction}
      </div>
    </div>
  )
}