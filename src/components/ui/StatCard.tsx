import type { LucideIcon } from 'lucide-react'
import Card from './Card'

type Tone = 'emerald' | 'red' | 'slate' | 'amber'

const toneClass: Record<Tone, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'slate',
}: {
  icon: LucideIcon
  label: string
  value: string
  tone?: Tone
}) {
  const { bg, text } = toneClass[tone]

  return (
    <Card className="p-4">
      <div className={`mb-3 inline-flex rounded-xl p-2 ${bg}`}>
        <Icon className={`h-5 w-5 ${text}`} />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-xl font-bold ${text}`}>{value}</p>
    </Card>
  )
}
