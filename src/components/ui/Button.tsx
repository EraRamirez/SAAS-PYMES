import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClass: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 disabled:bg-emerald-400',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  ghost: 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100',
}

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
>

type Props = NativeButtonProps & {
  variant?: Variant
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variantClass[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  )
}
