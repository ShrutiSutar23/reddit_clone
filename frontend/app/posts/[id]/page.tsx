'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { Post } from '@/types'
import { postApi } from '@/lib/api'
import PostDetail from '@/components/post/PostDetail'
import VoteButton from '@/components/vote/VoteButton'
import CommentSection from '@/components/comment/CommentSection'
import { Spinner, Card } from '@/components/ui'

export default function PostDetailPage() {
  const { id }                    = useParams<{ id: string }>()
  const [post,     setPost]       = useState<Post | null>(null)
  const [loading,  setLoading]    = useState(true)
  const [notFound, setNotFound]   = useState(false)

  useEffect(() => {
    if (!id) return
    postApi.get(Number(id))
      .then(res => setPost(res.data))
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  // Callback so VoteButton can update vote_count in parent state
  const handleVoteUpdate = (newCount: number, newUserVote: string | null) => {
    setPost(prev => prev
      ? { ...prev, vote_count: newCount, user_vote: newUserVote as Post['user_vote'] }
      : prev
    )
  }

  if (loading) return <Spinner />

  if (notFound || !post) {
    return (
      <div className="text-center py-20">
        <FileText size={48} className="text-zinc-700 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-zinc-300 mb-2">Post not found</h1>
        <p className="text-zinc-500 text-sm mb-6">
          This post may have been deleted or never existed.
        </p>
        <Link
          href="/"
          className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-6">

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Back link */}
        <Link
          href={`/communities/${post.community.name}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          r/{post.community.name}
        </Link>

        {/* Vote + post content side by side on desktop */}
        <div className="flex gap-3">
          {/* Vote button column */}
          <div className="flex-shrink-0">
            <VoteButton
              postId={post.id}
              voteCount={post.vote_count}
              userVote={post.user_vote}
              onVoteUpdate={handleVoteUpdate}
              orientation="vertical"
            />
          </div>

          {/* Post detail */}
          <div className="flex-1 min-w-0">
            <PostDetail post={post} />
          </div>
        </div>

        {/* Comments section */}
        <CommentSection
          postId={post.id}
          commentCount={post.comment_count}
          onCommentCountChange={count =>
            setPost(prev => prev ? { ...prev, comment_count: count } : prev)
          }
        />
      </div>

      {/* ── Sidebar ── */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Card className="p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Community
          </h3>
          <Link
            href={`/communities/${post.community.name}`}
            className="text-orange-400 hover:text-orange-300 font-medium text-sm transition-colors"
          >
            r/{post.community.name}
          </Link>
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 text-xs text-zinc-500">
            <div className="flex justify-between">
              <span>Author</span>
              <span className="text-zinc-300">u/{post.author.username}</span>
            </div>
            <div className="flex justify-between">
              <span>Votes</span>
              <span className={post.vote_count >= 0 ? 'text-orange-400' : 'text-indigo-400'}>
                {post.vote_count}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Comments</span>
              <span className="text-zinc-300">{post.comment_count}</span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}
