/**
 * Floating AI Readiness Copilot — landing demo + authenticated dashboard
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBrain, FaMicrophone, FaPaperPlane, FaTimes } from 'react-icons/fa'
import { aiAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const DEMO_REPLIES = {
  readiness: 'Based on demo data: readiness score is 78%. Speed improved 12% — maintain agility drills and monitor hamstring load before Saturday\'s meet.',
  injury: 'Injury risk is LOW. No active injuries in 90 days. Recommend dynamic warm-up and 48hr recovery between high-intensity sessions.',
  performance: 'Performance trend: Strength +8%, Endurance +5%, Flexibility -3%. AI suggests adding 2 mobility sessions per week.',
  attendance: 'Attendance rate 94% — excellent consistency. Athletes with 90%+ attendance show 23% faster recovery in our dataset.',
  default: 'I\'m AthleteForge AI Copilot. Ask about readiness, injury risk, performance trends, or attendance.',
}

function matchReply(text) {
  const q = text.toLowerCase()
  if (q.includes('ready') || q.includes('readiness')) return DEMO_REPLIES.readiness
  if (q.includes('injur') || q.includes('risk')) return DEMO_REPLIES.injury
  if (q.includes('perform') || q.includes('speed') || q.includes('strength')) return DEMO_REPLIES.performance
  if (q.includes('attend')) return DEMO_REPLIES.attendance
  return DEMO_REPLIES.default
}

function buildInsightsReply(data) {
  if (!data) return null
  const parts = []
  if (data.progress_summary?.summary) parts.push(data.progress_summary.summary)
  if (data.performance_insights?.available) {
    parts.push(`${data.performance_insights.headline}. ${data.performance_insights.recommendation}`)
  }
  if (data.injury_risk?.message) parts.push(data.injury_risk.message)
  return parts.join(' ') || null
}

export default function AICopilotWidget({ mode = 'demo', athleteId = null }) {
  const { user, isStudent } = useAuth()
  const authenticated = mode === 'app' && user

  const welcome = authenticated
    ? (isStudent
      ? `Hi ${user.first_name || 'athlete'} — I'm your personal AI coach. Ask about your readiness, injuries, or training focus.`
      : `Coach ${user.first_name || ''} — AI Copilot online. Ask about team readiness, injury risk, or athlete performance.`.trim())
    : 'Hey — I\'m your AI Readiness Copilot. Ask "What\'s my readiness?" or tap the mic for voice input.'

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: welcome }])
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const recognitionRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speakTip = (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text.slice(0, 280))
      utter.rate = 0.95
      window.speechSynthesis.speak(utter)
    }
  }

  const fetchAIReply = async (text) => {
    if (authenticated) {
      const params = athleteId ? { athlete_id: athleteId } : {}
      const res = await aiAPI.getInsights(params)
      const built = buildInsightsReply(res.data)
      if (built) return built
    }
    try {
      const res = await aiAPI.getDemo()
      const built = buildInsightsReply(res.data)
      if (built) return built
    } catch {
      /* fallback */
    }
    return matchReply(text)
  }

  const sendMessage = async (text) => {
    const trimmed = text?.trim()
    if (!trimmed) return

    setMessages(m => [...m, { role: 'user', text: trimmed }])
    setInput('')
    setLoading(true)

    let reply = matchReply(trimmed)
    try {
      reply = await fetchAIReply(trimmed)
    } catch {
      reply = matchReply(trimmed)
    }

    setLoading(false)
    setMessages(m => [...m, { role: 'bot', text: reply }])
    speakTip(reply)
  }

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessages(m => [...m, { role: 'bot', text: 'Voice input needs Chrome or Edge. Type your question instead.' }])
      return
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    recognitionRef.current = rec

    rec.onresult = (e) => {
      sendMessage(e.results[0][0].transcript)
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)

    rec.start()
    setListening(true)
  }

  return (
    <>
      <button
        type="button"
        className="mdnt-copilot-trigger"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close AI Copilot' : 'Open AI Copilot'}
      >
        {!open && <span className="pulse-ring" aria-hidden="true" />}
        <FaBrain />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mdnt-copilot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mdnt-copilot-header">
              <h3>
                <FaBrain /> AI Copilot
                <span className="ai-badge">{authenticated ? 'PERSONAL' : 'LIVE'}</span>
              </h3>
              <button type="button" className="mdnt-copilot-close" onClick={() => setOpen(false)} aria-label="Close">
                <FaTimes />
              </button>
            </div>

            <div className="mdnt-copilot-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`mdnt-copilot-msg ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="mdnt-copilot-msg bot">Analyzing athlete data...</div>
              )}
              <div ref={endRef} />
            </div>

            <div className="mdnt-copilot-input-row">
              <input
                className="mdnt-copilot-input"
                placeholder="Ask about readiness, injuries..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              />
              <button
                type="button"
                className={`mdnt-copilot-voice${listening ? ' listening' : ''}`}
                onClick={toggleVoice}
                aria-label="Voice input"
              >
                <FaMicrophone />
              </button>
              <button
                type="button"
                className="mdnt-copilot-send"
                onClick={() => sendMessage(input)}
                aria-label="Send"
              >
                <FaPaperPlane />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}