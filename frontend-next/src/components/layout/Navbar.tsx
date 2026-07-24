import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Magnetic } from '@/components/motion/Magnetic'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Intelligence', href: '#intelligence' },
  { label: 'Proof', href: '#proof' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isStaff } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuRef.current) return
    if (menuOpen) {
      gsap.set(menuRef.current, { display: 'flex' })
      gsap.fromTo(menuRef.current, { yPercent: -100 }, { yPercent: 0, duration: 0.6, ease: 'power4.inOut' })
      gsap.fromTo(
        menuRef.current.querySelectorAll('[data-menu-item]'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, delay: 0.2, ease: 'power3.out' },
      )
    } else {
      gsap.to(menuRef.current, {
        yPercent: -100,
        duration: 0.5,
        ease: 'power3.in',
        onComplete: () => gsap.set(menuRef.current, { display: 'none' }),
      })
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled ? 'border-b border-border bg-background/80 backdrop-blur-xl' : 'bg-transparent',
        )}
      >
        <nav className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 lg:px-12">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-text" data-cursor-hover="Home">
            ATHLETE<span className="text-accent">FORGE</span>
          </Link>

          <div className="hidden items-center gap-10 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-[13px] font-medium uppercase tracking-widest text-text-secondary transition-colors hover:text-text"
                data-cursor-hover={link.label}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            {user ? (
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  {isStaff ? 'Dashboard' : 'My Portal'}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="font-body text-[13px] font-medium text-text-secondary transition-colors hover:text-text" data-cursor-hover="Sign in">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button size="sm">Request Access</Button>
                </Link>
              </>
            )}
          </div>

          <Magnetic
            as="button"
            className="flex size-11 items-center justify-center rounded-full border border-border-strong lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </Magnetic>
        </nav>
      </header>

      <div
        ref={menuRef}
        className="fixed inset-0 z-40 hidden flex-col justify-center gap-2 bg-background px-8 lg:hidden"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            data-menu-item
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between border-b border-border py-5 font-display text-4xl font-extrabold uppercase text-text"
          >
            {link.label}
            <ArrowUpRight className="text-accent" />
          </a>
        ))}
        <div data-menu-item className="mt-8 flex flex-col gap-4">
          {user ? (
            <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
              <Button className="w-full">{isStaff ? 'Dashboard' : 'My Portal'}</Button>
            </Link>
          ) : (
            <>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                <Button className="w-full">Request Access</Button>
              </Link>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
