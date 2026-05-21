'use client'

import PostFeed from '@/components/post/PostFeed'
import CommunitySidebar from '@/components/community/CommunitySidebar'

export default function HomePage() {
  return (
    <div className="flex gap-6">

      {/* ── Main feed ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-zinc-100">Home Feed</h1>
        </div>
        <PostFeed />
      </div>

      {/* ── Sidebar ── */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <CommunitySidebar />
      </div>

    </div>
  )
}
