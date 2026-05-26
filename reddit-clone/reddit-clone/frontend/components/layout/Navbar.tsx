'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { LogOut, PlusCircle, User, Flame, Users } from 'lucide-react'

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/')

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-2 text-orange-500 font-bold text-xl tracking-tight hover:text-orange-400 transition-colors flex-shrink-0"
        >
          <Flame size={22} />
          <span className="hidden sm:inline">ThreadFire</span>
        </Link>

        {/* ── Nav links ── */}
        <div className="flex items-center gap-1">
          <Link
            href="/communities"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isActive('/communities')
                ? 'text-orange-400 bg-orange-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Users size={14} />
            <span className="hidden sm:inline">Communities</span>
          </Link>
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoggedIn ? (
            <>
              <Link
                href="/posts/create"
                className="flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-full font-medium transition-colors"
              >
                <PlusCircle size={15} />
                <span className="hidden sm:inline">New Post</span>
              </Link>

              <Link
                href={`/users/${user?.username}`}
                className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-400">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline font-medium text-sm">
                  {user?.username}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-zinc-500 hover:text-zinc-200 transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-300 hover:text-white transition-colors px-3 py-1.5"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm bg-orange-500 hover:bg-orange-400 text-white px-4 py-1.5 rounded-full font-medium transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
