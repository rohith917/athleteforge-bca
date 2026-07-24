import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Preloader } from '@/components/layout/Preloader'
import { CustomCursor } from '@/components/motion/CustomCursor'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Home } from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <SmoothScroll>
      <CustomCursor />
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <main>
                <Home ready={loaded} />
              </main>
              <Footer />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </SmoothScroll>
  )
}
