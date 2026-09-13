import { motion } from 'framer-motion'
import type { HTMLAttributes, ReactNode } from 'react'

type NativeDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
>

type Props = NativeDivProps & {
  children: ReactNode
  hover?: boolean
}

export default function Card({ children, hover = false, className = '', ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, boxShadow: '0 8px 24px -8px rgb(15 23 42 / 0.12)' } : undefined}
      className={`rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
