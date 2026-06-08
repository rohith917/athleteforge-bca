/**
 * Reusable loading spinner component.
 */
export default function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
  return (
    <div className={`loading-spinner-wrap ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="spinner-ring" />
      <p className="spinner-text">{message}</p>
    </div>
  )
}