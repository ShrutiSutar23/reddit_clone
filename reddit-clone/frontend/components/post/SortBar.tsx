'use client'

import { Zap, TrendingUp, Clock } from 'lucide-react'
import { SortOrder } from '@/types'

const SORT_OPTIONS: { value: SortOrder; label: string; icon: React.ReactNode }[] = [
  { value: 'new', label: 'New',  icon: <Zap       size={13} /> },
  { value: 'top', label: 'Top',  icon: <TrendingUp size={13} /> },
  { value: 'old', label: 'Old',  icon: <Clock      size={13} /> },
]

interface SortBarProps {
  current:  SortOrder
  onChange: (sort: SortOrder) => void
}

export default function SortBar({ current, onChange }: SortBarProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
      {SORT_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-150
            ${current === opt.value
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }
          `}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
