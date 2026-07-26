/**
 * Reusable loading spinner component.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function LoadingSpinner({
  message = 'Loading...',
  fullScreen = false,
  hint = null,
  onRetry = null,
}) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const showColdStart = seconds >= 4
  const showRetry = seconds >= 8 && onRetry

  return (
    <div className={`loading-spinner-wrap ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="spinner-ring" aria-hidden="true" />
      <p className="spinner-text">{message}</p>
      {showColdStart && (
        <p className="spinner-coldstart">
          Server may be waking up (Render free tier). Please wait up to 60 seconds on first load.
        </p>
      )}
      {hint && <p className="spinner-hint">{hint}</p>}
      {showRetry && (
        <button type="button" className="btn-outline-gold spinner-retry-btn" onClick={onRetry}>
          Retry connection
        </button>
      )}
      {fullScreen && seconds >= 6 && (
        <p className="spinner-hint">
          <Link to="/login">Skip to Login</Link>
          {' · '}
          <Link to="/">Go Home</Link>
        </p>
      )}
    </div>
  )
}