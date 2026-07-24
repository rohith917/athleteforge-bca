import { useState, type SyntheticEvent } from 'react'
import { resolveMediaUrl, uiAvatarUrl } from '@/lib/mediaUrl'
import { cn } from '@/lib/utils'

const SIZES = { xs: 26, sm: 32, md: 40, lg: 96 } as const

interface AvatarProps {
  src?: string | null
  name?: string
  size?: keyof typeof SIZES
  className?: string
}

export function Avatar({ src, name = 'User', size = 'md', className }: AvatarProps) {
  const px = SIZES[size]
  const fallback = uiAvatarUrl(name, px * 2)
  const [errored, setErrored] = useState(false)
  const resolved = resolveMediaUrl(src)

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    if (!errored) {
      setErrored(true)
      e.currentTarget.src = fallback
    }
  }

  return (
    <img
      src={resolved || fallback}
      alt={name}
      onError={handleError}
      className={cn('shrink-0 rounded-full object-cover', className)}
      style={{ width: px, height: px }}
    />
  )
}
