import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export default function TextField({ label, className = '', id, ...rest }: Props) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-600">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${className}`}
        {...rest}
      />
    </div>
  )
}
