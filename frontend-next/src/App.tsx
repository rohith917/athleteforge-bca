import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Preloader } from '@/components/layout/Preloader'
import { CustomCursor } from '@/components/motion/CustomCursor'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Home } from '@/pages/Home'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <SmoothScroll>
      <CustomCursor />
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home ready={loaded} />} />
        </Routes>
      </main>
      <Footer />
    </SmoothScroll>
  )
}
