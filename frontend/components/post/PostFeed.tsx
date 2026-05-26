'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { Post, SortOrder } from '@/types'
import { postApi } from '@/lib/api'
import PostCard from '@/components/post/PostCard'
import SortBar from '@/components/post/SortBar'
import { Spinner, EmptyState, Button } from '@/components/ui'

interface PostFeedProps {
  communityName?: string    // if set → fetch only posts from this community
}

const PER_PAGE = 10

export default function PostFeed({ communityName }: PostFeedProps) {
  const [posts,    setPosts]    = useState<Post[]>([])
  const [sort,     setSort]     = useState<SortOrder>('new')
  const [page,     setPage]     = useState(1)
  const [hasMore,  setHasMore]  = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [loadMore, setLoadMore] = useState(false)
  const [error,    setError]    = useState('')

  // ── Fetch posts ───────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (
    currentSort: SortOrder,
    currentPage: number,
    append: boolean,
  ) => {
    append ? setLoadMore(true) : setLoading(true)
    setError('')

    try {
      const params = { sort: currentSort, page: currentPage, per_page: PER_PAGE }
      const res = communityName
        ? await postApi.getByCommunity(communityName, params)
        : await postApi.list(params)

      const data = res.data
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts)
      setHasMore(data.has_more)
    } catch {
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
      setLoadMore(false)
    }
  }, [communityName])

  // Re-fetch when sort changes (reset to page 1)
  useEffect(() => {
    setPage(1)
    fetchPosts(sort, 1, false)
  }, [sort, fetchPosts])

  const handleSortChange = (newSort: SortOrder) => {
    setSort(newSort)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(sort, nextPage, true)
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">

      {/* Sort bar */}
      <SortBar current={sort} onChange={handleSortChange} />

      {/* Loading state */}
      {loading && <Spinner />}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-zinc-900 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchPosts(sort, 1, false)}
          >
            <RefreshCw size={13} />
            Try again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && posts.length === 0 && (
        <EmptyState
          icon={<FileText size={40} />}
          title="No posts yet"
          description={
            communityName
              ? `Be the first to post in r/${communityName}!`
              : 'No posts found. Create a community and start posting!'
          }
        />
      )}

      {/* Posts list */}
      {!loading && posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Load more button */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            size="md"
            loading={loadMore}
            onClick={handleLoadMore}
          >
            {loadMore ? 'Loading…' : 'Load more posts'}
          </Button>
        </div>
      )}

    </div>
  )
}
