'use client'

import Link from 'next/link'
import { Flame } from 'lucide-react'
import { ReactNode } from 'react'

interface AuthFormWrapperProps {
  title:       string
  subtitle:    string
  footerText:  string
  footerLink:  string
  footerLabel: string
  children:    ReactNode
}

export default function AuthFormWrapper({
  title,
  subtitle,
  footerText,
  footerLink,
  footerLabel,
  children,
}: AuthFormWrapperProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md fade-in">

        {/* ── Logo ── */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-500 font-bold text-2xl"
          >
            <Flame size={28} />
            ThreadFire
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-zinc-100">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>

        {/* ── Form card ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl shadow-black/40">
          {children}
        </div>

        {/* ── Footer link ── */}
        <p className="text-center text-sm text-zinc-500 mt-5">
          {footerText}{' '}
          <Link
            href={footerLink}
            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            {footerLabel}
          </Link>
        </p>

      </div>
    </div>
  )
}
