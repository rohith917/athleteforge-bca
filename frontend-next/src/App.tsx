import { useState } from 'react'
import { Preloader } from '@/components/layout/Preloader'
import { CustomCursor } from '@/components/motion/CustomCursor'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { Hero } from '@/components/sections/Hero'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <SmoothScroll>
      <CustomCursor />
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <main>
        <Hero ready={loaded} />
      </main>
    </SmoothScroll>
  )
}
