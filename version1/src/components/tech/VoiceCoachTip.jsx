/**
 * Voice coach tip — reads full AI coaching brief aloud
 */
import { useState, useEffect } from 'react'
import { FaVolumeUp, FaStop } from 'react-icons/fa'
import { aiAPI } from '../../services/api'

export default function VoiceCoachTip({ athleteId = null }) {
  const [brief, setBrief] = useState('')
  const [planItems, setPlanItems] = useState([])
  const [speaking, setSpeaking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = athleteId ? { athlete_id: athleteId } : {}
    aiAPI.getInsights(params)
      .then((res) => {
        const d = res.data
        setBrief(d.coaching_brief || d.progress_summary?.summary || '')
        setPlanItems(d.training_plan?.items?.slice(0, 3) || [])
      })
      .catch(() => setBrief('Log performance and attendance data for personalized AI coaching briefs.'))
      .finally(() => setLoading(false))
  }, [athleteId])

  const stopSpeech = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }

  const playTip = () => {
    if (speaking) { stopSpeech(); return }
    const text = [brief, ...planItems.map((item, i) => `Action ${i + 1}: ${item}`)].join(' ')
    if (!text || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(text.slice(0, 600))
    utter.rate = 0.9
    utter.onend = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  useEffect(() => () => stopSpeech(), [])

  return (
    <div className="voice-coach-tip">
      <p>{loading ? 'Building AI coaching brief...' : brief}</p>
      {!loading && planItems.length > 0 && (
        <ul className="ai-plan-list" style={{ fontSize: '0.82rem', marginBottom: 12 }}>
          {planItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )}
      <button type="button" className={`voice-play-btn${speaking ? ' speaking' : ''}`} onClick={playTip} disabled={loading}>
        {speaking ? <><FaStop /> Stop</> : <><FaVolumeUp /> Hear Full Brief</>}
      </button>
    </div>
  )
}