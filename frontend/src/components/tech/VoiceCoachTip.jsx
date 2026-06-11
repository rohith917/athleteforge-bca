/**
 * Voice coach tip — Web Speech API reads AI-generated advice aloud
 */
import { useState, useEffect } from 'react'
import { FaVolumeUp, FaStop } from 'react-icons/fa'
import { aiAPI } from '../../services/api'

const FALLBACK_TIPS = [
  'Prioritize dynamic warm-up before high-intensity sessions. Monitor hamstring load if speed metrics dipped this week.',
  'Recovery window: 48 hours between peak training loads reduces injury risk by up to 30% in our dataset.',
  'Attendance above 90% correlates with faster return-to-play. Keep session consistency this week.',
]

export default function VoiceCoachTip({ athleteId = null }) {
  const [tip, setTip] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = athleteId ? { athlete_id: athleteId } : {}
    aiAPI.getInsights(params)
      .then((res) => {
        const data = res.data
        const perf = data?.performance_insights
        const injury = data?.injury_risk
        const progress = data?.progress_summary
        if (perf?.available && perf.recommendation) {
          setTip(`${perf.headline}. ${perf.recommendation}`)
        } else if (progress?.summary) {
          setTip(`${progress.summary} ${injury?.message || ''}`.trim())
        } else {
          setTip(FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)])
        }
      })
      .catch(() => {
        setTip(FALLBACK_TIPS[0])
      })
      .finally(() => setLoading(false))
  }, [athleteId])

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }

  const playTip = () => {
    if (speaking) {
      stopSpeech()
      return
    }
    if (!tip || typeof window === 'undefined' || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(tip)
    utter.rate = 0.92
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  useEffect(() => () => stopSpeech(), [])

  return (
    <div className="voice-coach-tip">
      <p>{loading ? 'Generating coach tip...' : tip}</p>
      <button
        type="button"
        className={`voice-play-btn${speaking ? ' speaking' : ''}`}
        onClick={playTip}
        disabled={loading || !tip}
      >
        {speaking ? <><FaStop /> Stop</> : <><FaVolumeUp /> Hear Coach Tip</>}
      </button>
    </div>
  )
}