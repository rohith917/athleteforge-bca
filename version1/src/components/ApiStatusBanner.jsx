/**
 * Shown only when the server is slow or truly unreachable — not when user is logged out.
 */
import { useAuth } from '../context/AuthContext'

export default function ApiStatusBanner() {
  const { apiStatus, retryBootstrap } = useAuth()

  if (apiStatus === 'ok') return null

  const isWaking = apiStatus === 'waking'

  const handleAction = () => {
    if (isWaking) {
      retryBootstrap()
      return
    }
    window.location.reload()
  }

  return (
    <div
      className={`api-status-banner ${isWaking ? 'api-status-waking' : 'api-status-error'}`}
      role="alert"
    >
      <div className="api-status-inner">
        <strong>{isWaking ? 'Loading AthleteForge…' : 'Server is temporarily unavailable'}</strong>
        <p>
          {isWaking
            ? 'Please wait a moment while we connect to the server.'
            : 'The server may be starting up. Refresh the page or try again in a few seconds.'}
        </p>
        <button type="button" className="api-status-retry" onClick={handleAction}>
          {isWaking ? 'Try again' : 'Refresh page'}
        </button>
      </div>
    </div>
  )
}