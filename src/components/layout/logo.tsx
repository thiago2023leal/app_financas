import Image from 'next/image'
import { cn } from '@/lib/utils'

const ASPECT_RATIO = 1983 / 793

export function Logo({ height = 44, className }: { height?: number; className?: string }) {
  return (
    <Image
      src="/logo-lfinancas.png"
      alt="L-Finanças"
      width={Math.round(height * ASPECT_RATIO)}
      height={height}
      className={cn('flex-shrink-0', className)}
      priority
    />
  )
}
