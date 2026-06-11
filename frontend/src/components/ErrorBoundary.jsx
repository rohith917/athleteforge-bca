import React from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('AthleteForge render error:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children
    const showDetails = import.meta.env.DEV && this.state.error?.message

    return (
      <div className="error-boundary-screen">
        <div className="error-boundary-card">
          <h1>Something went wrong</h1>
          <p>The page hit an unexpected error. Refresh to try again.</p>
          {showDetails && (
            <pre className="error-boundary-details">{this.state.error.message}</pre>
          )}
          <div className="error-boundary-actions">
            <button type="button" className="btn-gold" onClick={this.handleRetry}>
              Refresh page
            </button>
            <Link to="/" className="btn-outline-gold" onClick={() => this.setState({ hasError: false, error: null })}>
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
