/**
 * Shows when the backend API is unreachable (cold start / wrong URL).
 */
import { useAuth } from '../context/AuthContext'

export default function ApiStatusBanner() {
  const { apiStatus, retryBootstrap } = useAuth()

  if (apiStatus === 'ok') return null

  const isWaking = apiStatus === 'waking'

  return (
    <div
      className={`api-status-banner ${isWaking ? 'api-status-waking' : 'api-status-error'}`}
      role="alert"
    >
      <div className="api-status-inner">
        <strong>{isWaking ? 'Server is waking up…' : 'Cannot reach the API server'}</strong>
        <p>
          {isWaking
            ? 'Render free tier sleeps after inactivity. This can take 30–60 seconds on first load.'
            : 'Check your connection, wait for the server to wake up, then try again.'}
        </p>
        <button type="button" className="api-status-retry" onClick={retryBootstrap}>
          Retry connection
        </button>
      </div>
    </div>
  )
}