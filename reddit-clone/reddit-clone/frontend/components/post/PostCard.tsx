'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MessageSquare, FileText, Link2, Image, ChevronUp, ChevronDown } from 'lucide-react'
import { Post } from '@/types'
import { timeAgo, formatVoteCount, getErrorMessage } from '@/lib/utils'
import { voteApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

const typeIcons = {
  text:  <FileText size={12} className="text-zinc-500" />,
  link:  <Link2    size={12} className="text-blue-400"  />,
  image: <Image    size={12} className="text-green-400" />,
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post: initialPost }: PostCardProps) {
  const { isLoggedIn }  = useAuth()
  const [post, setPost] = useState(initialPost)
  const [voting, setVoting] = useState(false)

  const handleVote = async (e: React.MouseEvent, type: 'upvote' | 'downvote') => {
    e.preventDefault()   // stop Link navigation
    e.stopPropagation()

    if (!isLoggedIn) { toast.error('Login to vote'); return }

    // Optimistic update
    let newCount = post.vote_count
    let newVote: string | null = type
    if (post.user_vote === type) {
      newCount += type === 'upvote' ? -1 : 1
      newVote   = null
    } else if (post.user_vote !== null) {
      newCount += type === 'upvote' ? 2 : -2
    } else {
      newCount += type === 'upvote' ? 1 : -1
    }
    setPost(p => ({ ...p, vote_count: newCount, user_vote: newVote as Post['user_vote'] }))

    setVoting(true)
    try {
      const res = await voteApi.vote(post.id, type)
      setPost(p => ({ ...p, vote_count: res.data.new_vote_count, user_vote: res.data.user_vote as Post['user_vote'] }))
    } catch (err) {
      setPost(initialPost)
      toast.error(getErrorMessage(err))
    } finally {
      setVoting(false)
    }
  }

  const isPositive = post.vote_count > 0
  const isNegative = post.vote_count < 0

  return (
    <Link href={`/posts/${post.id}`}>
      <article className="group flex gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/30 cursor-pointer">

        {/* ── Vote column ── */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <button
            onClick={e => handleVote(e, 'upvote')}
            disabled={voting}
            className={`p-1 rounded-md transition-all ${
              post.user_vote === 'upvote'
                ? 'text-orange-400 bg-orange-500/15'
                : 'text-zinc-600 hover:text-orange-400 hover:bg-orange-500/10'
            }`}
          >
            <ChevronUp size={16} strokeWidth={2.5} />
          </button>

          <span className={`text-xs font-bold leading-none ${
            isPositive ? 'text-orange-400' : isNegative ? 'text-indigo-400' : 'text-zinc-500'
          }`}>
            {formatVoteCount(post.vote_count)}
          </span>

          <button
            onClick={e => handleVote(e, 'downvote')}
            disabled={voting}
            className={`p-1 rounded-md transition-all ${
              post.user_vote === 'downvote'
                ? 'text-indigo-400 bg-indigo-500/15'
                : 'text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10'
            }`}
          >
            <ChevronDown size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 mb-1.5">
            <span className="text-orange-400/80 hover:text-orange-400 font-medium transition-colors">
              <Link href={`/communities/${post.community.name}`} onClick={e => e.stopPropagation()}>
                r/{post.community.name}
              </Link>
            </span>
            <span>·</span>
            <span>u/{post.author.username}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              {typeIcons[post.post_type]}
              {post.post_type}
            </span>
          </div>

          <h2 className="text-zinc-100 font-semibold text-sm leading-snug group-hover:text-white transition-colors line-clamp-2">
            {post.title}
          </h2>

          {post.post_type === 'text' && post.content && (
            <p className="text-zinc-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {post.content}
            </p>
          )}

          {post.post_type === 'link' && post.content && (
            <p className="text-blue-400 text-xs mt-1.5 truncate">🔗 {post.content}</p>
          )}

          <div className="flex items-center gap-1.5 mt-3 text-xs text-zinc-600">
            <MessageSquare size={12} />
            <span>{post.comment_count === 1 ? '1 comment' : `${post.comment_count} comments`}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
