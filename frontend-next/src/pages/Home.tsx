import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Platform } from '@/components/sections/Platform'
import { Intelligence } from '@/components/sections/Intelligence'
import { CoreShowcase } from '@/components/sections/CoreShowcase'
import { Testimonials } from '@/components/sections/Testimonials'
import { Pricing } from '@/components/sections/Pricing'
import { Faq } from '@/components/sections/Faq'
import { Contact } from '@/components/sections/Contact'

export function Home({ ready }: { ready: boolean }) {
  return (
    <>
      <Hero ready={ready} />
      <About />
      <Platform />
      <Intelligence />
      <CoreShowcase />
      <Testimonials />
      <Pricing />
      <Faq />
      <Contact />
    </>
  )
}
