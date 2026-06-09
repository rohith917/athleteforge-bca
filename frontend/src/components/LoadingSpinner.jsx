/**
 * Reusable loading spinner component.
 */
export default function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
  return (
    <div className={`loading-spinner-wrap ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="spinner-ring" aria-hidden="true" />
      <p className="spinner-text">{message}</p>
      {fullScreen && (
        <p className="spinner-hint">
          <a href="/login">Go to Login</a>
        </p>
      )}
    </div>
  )
}