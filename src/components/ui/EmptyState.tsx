import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

export default function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 px-4 py-12 text-center"
    >
      <div className="rounded-full bg-slate-100 p-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </motion.div>
  )
}
