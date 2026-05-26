'use client'

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

// ── Button ────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-orange-500 hover:bg-orange-400 text-white',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700',
    ghost:     'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200',
    danger:    'bg-red-600 hover:bg-red-500 text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}


// ── Input ─────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:  string
  error?:  string
  helper?: string
}

export function Input({ label, error, helper, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-300">{label}</label>
      )}
      <input
        className={`
          w-full bg-zinc-900 border rounded-lg px-3 py-2.5 text-sm text-zinc-100
          placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50
          transition-colors
          ${error ? 'border-red-500' : 'border-zinc-700 focus:border-orange-500/50'}
          ${className}
        `}
        {...props}
      />
      {error  && <p className="text-xs text-red-400">{error}</p>}
      {helper && !error && <p className="text-xs text-zinc-500">{helper}</p>}
    </div>
  )
}


// ── Textarea ──────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-zinc-300">{label}</label>
      )}
      <textarea
        className={`
          w-full bg-zinc-900 border rounded-lg px-3 py-2.5 text-sm text-zinc-100
          placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50
          transition-colors resize-none
          ${error ? 'border-red-500' : 'border-zinc-700 focus:border-orange-500/50'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}


// ── Spinner ───────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex justify-center items-center p-8">
      <Loader2 size={size} className="animate-spin text-orange-500" />
    </div>
  )
}


// ── EmptyState ────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-zinc-700 mb-4">{icon}</div>}
      <h3 className="text-zinc-300 font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-zinc-500 text-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}


// ── Card ──────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-xl ${className}`}
    >
      {children}
    </div>
  )
}

// Re-export named exports for clean imports
// Usage: import { Button, Input } from '@/components/ui'
