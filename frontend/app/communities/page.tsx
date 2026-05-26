'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, PlusCircle, Users } from 'lucide-react'
import { Community } from '@/types'
import { communityApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import CommunityCard from '@/components/community/CommunityCard'
import { Spinner, EmptyState, Button, Input } from '@/components/ui'

const PER_PAGE = 12

export default function CommunitiesPage() {
  const { isLoggedIn } = useAuth()

  const [communities, setCommunities] = useState<Community[]>([])
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [searching,   setSearching]   = useState(false)

  // ── Fetch communities ─────────────────────────────────────────────────
  const fetchCommunities = async (
    searchTerm: string,
    currentPage: number,
    append: boolean,
  ) => {
    append ? setSearching(true) : setLoading(true)
    try {
      const res  = await communityApi.list({
        page:     currentPage,
        per_page: PER_PAGE,
        search:   searchTerm || undefined,
      })
      const data = res.data
      setCommunities(prev => append ? [...prev, ...data.communities] : data.communities)
      setHasMore(data.has_more)
      setTotal(data.total)
    } catch {
      // silently fail – empty state shows
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  // Initial load
  useEffect(() => { fetchCommunities('', 1, false) }, [])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchCommunities(search, 1, false)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchCommunities(search, nextPage, true)
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Communities</h1>
          {!loading && (
            <p className="text-sm text-zinc-500 mt-0.5">
              {total} {total === 1 ? 'community' : 'communities'}
            </p>
          )}
        </div>
        {isLoggedIn && (
          <Link href="/communities/create">
            <Button size="sm">
              <PlusCircle size={14} />
              Create
            </Button>
          </Link>
        )}
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-6">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search communities…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="
            w-full bg-zinc-900 border border-zinc-700 rounded-xl
            pl-9 pr-4 py-2.5 text-sm text-zinc-100
            placeholder:text-zinc-600 focus:outline-none
            focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40
            transition-all
          "
        />
      </div>

      {/* ── Content ── */}
      {loading ? (
        <Spinner />
      ) : communities.length === 0 ? (
        <EmptyState
          icon={<Users size={40} />}
          title={search ? `No results for "${search}"` : 'No communities yet'}
          description={
            search
              ? 'Try a different search term'
              : 'Be the first to create a community!'
          }
          action={
            isLoggedIn ? (
              <Link href="/communities/create">
                <Button size="sm">
                  <PlusCircle size={14} />
                  Create Community
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Grid of community cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {communities.map(community => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="secondary"
                loading={searching}
                onClick={handleLoadMore}
              >
                {searching ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
