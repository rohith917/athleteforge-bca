/**
 * Floating AI Copilot — uses /api/ai/copilot/ for rich contextual answers
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBrain, FaMicrophone, FaPaperPlane, FaTimes } from 'react-icons/fa'
import { aiAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const SUGGESTED = [
  'Give me a full summary',
  'What is my readiness score?',
  'Injury risk and prevention tips',
  'Weekly training plan',
  'Performance metrics breakdown',
]

export default function AICopilotWidget({ mode = 'demo', athleteId = null }) {
  const { user, isStudent } = useAuth()
  const authenticated = mode === 'app' && user

  const welcome = authenticated
    ? (isStudent
      ? `Hi ${user.first_name || 'athlete'} — I have your full performance, injury, attendance, and competition data loaded. Try "Give me a full summary" or ask anything specific.`
      : `Coach ${user.first_name || ''} — AI Copilot has deep analytics ready. Ask about readiness, injuries, training plans, or say "full summary".`.trim())
    : 'AI Copilot online with demo data. Try: "What is my readiness?" · "Injury risk" · "Training plan" · or tap the mic.'

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
      const utter = new SpeechSynthesisUtterance(text.slice(0, 400))
      utter.rate = 0.92
      window.speechSynthesis.speak(utter)
    }
  }

  const askCopilot = async (text) => {
    const trimmed = text?.trim()
    if (!trimmed) return

    setMessages(m => [...m, { role: 'user', text: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const payload = { question: trimmed }
      if (athleteId) payload.athlete_id = athleteId
      const res = await aiAPI.copilot(payload)
      const answer = res.data?.answer || 'No response generated.'
      setMessages(m => [...m, { role: 'bot', text: answer }])
      speakTip(answer)
    } catch {
      setMessages(m => [...m, {
        role: 'bot',
        text: 'Could not reach AI engine. Check connection and try again, or ask from the AI Intelligence Report on your dashboard.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessages(m => [...m, { role: 'bot', text: 'Voice needs Chrome or Edge. Type your question instead.' }])
      return
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }
    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.onresult = (e) => askCopilot(e.results[0][0].transcript)
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }

  return (
    <>
      <button type="button" className="mdnt-copilot-trigger" onClick={() => setOpen(v => !v)} aria-label="AI Copilot">
        {!open && <span className="pulse-ring" aria-hidden="true" />}
        <FaBrain />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mdnt-copilot-panel mdnt-copilot-panel-rich"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="mdnt-copilot-header">
              <h3><FaBrain /> AI Copilot <span className="ai-badge">{authenticated ? 'DEEP' : 'DEMO'}</span></h3>
              <button type="button" className="mdnt-copilot-close" onClick={() => setOpen(false)}><FaTimes /></button>
            </div>

            <div className="copilot-suggestions">
              {SUGGESTED.map(s => (
                <button key={s} type="button" className="copilot-chip" onClick={() => askCopilot(s)} disabled={loading}>
                  {s}
                </button>
              ))}
            </div>

            <div className="mdnt-copilot-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`mdnt-copilot-msg ${msg.role}`}>{msg.text}</div>
              ))}
              {loading && <div className="mdnt-copilot-msg bot">Analyzing full athlete dataset...</div>}
              <div ref={endRef} />
            </div>

            <div className="mdnt-copilot-input-row">
              <input
                className="mdnt-copilot-input"
                placeholder="Ask anything — readiness, plan, injuries..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askCopilot(input)}
              />
              <button type="button" className={`mdnt-copilot-voice${listening ? ' listening' : ''}`} onClick={toggleVoice}>
                <FaMicrophone />
              </button>
              <button type="button" className="mdnt-copilot-send" onClick={() => askCopilot(input)}>
                <FaPaperPlane />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}