'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, TrendingUp } from 'lucide-react'
import { Community } from '@/types'
import { communityApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import CommunityCard from './CommunityCard'
import { Spinner } from '@/components/ui'

export default function CommunitySidebar() {
  const { isLoggedIn } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    communityApi
      .list({ page: 1, per_page: 8 })
      .then(res => setCommunities(res.data.communities))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <aside className="w-full space-y-4">

      {/* ── Create community card ── */}
      {isLoggedIn && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Communities
            </span>
          </div>
          <Link
            href="/communities/create"
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium
              bg-orange-500 hover:bg-orange-400 text-white rounded-lg transition-colors"
          >
            <PlusCircle size={14} />
            Create Community
          </Link>
        </div>
      )}

      {/* ── Community list ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Top Communities
          </span>
          <Link
            href="/communities"
            className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <Spinner size={16} />
        ) : communities.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-6 px-4">
            No communities yet.{' '}
            {isLoggedIn
              ? 'Be the first to create one!'
              : 'Login to create one!'}
          </p>
        ) : (
          <div className="py-1">
            {communities.map(c => (
              <CommunityCard key={c.id} community={c} compact />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer note ── */}
      <p className="text-xs text-zinc-700 text-center px-2">
        ThreadFire MVP · Built with Next.js + FastAPI
      </p>
    </aside>
  )
}
