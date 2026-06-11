/**
 * Application entry point.
 * AthleteForge - Athlete Performance and Injury Tracking System
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/App.css'
import './styles/luxury.css'
import './styles/premium.css'
import './styles/dribbble.css'
import './styles/mdnt.css'
import './styles/mdnt-dashboard.css'

const useHashRouter = typeof window !== 'undefined'
  && window.location.hostname.includes('athleteforge-frontend.onrender.com')
const Router = useHashRouter ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
)