import type { ReactNode, SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  children: ReactNode
}

export default function SelectField({ label, className = '', id, children, ...rest }: Props) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-sm font-medium text-slate-600">
        {label}
      </label>
      <select
        id={selectId}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition-shadow focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  )
}
