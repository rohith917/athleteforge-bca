import { useEffect, useState } from 'react'

/** Defer Chart.js mount — avoids StrictMode double-mount white screen crashes. */
export default function useChartsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  return ready
}