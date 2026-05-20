'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { voteApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { formatVoteCount, getErrorMessage } from '@/lib/utils'

interface VoteButtonProps {
  postId:       number
  voteCount:    number
  userVote:     string | null
  onVoteUpdate: (newCount: number, newUserVote: string | null) => void
  orientation?: 'vertical' | 'horizontal'
}

export default function VoteButton({
  postId,
  voteCount,
  userVote,
  onVoteUpdate,
  orientation = 'vertical',
}: VoteButtonProps) {
  const { isLoggedIn } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!isLoggedIn) {
      toast.error('Login to vote')
      return
    }

    // ── Optimistic UI update ──────────────────────────────────────────
    // Update UI immediately before API responds – feels instant
    let optimisticCount = voteCount
    let optimisticVote: string | null = type

    if (userVote === type) {
      // Undo vote
      optimisticCount += type === 'upvote' ? -1 : 1
      optimisticVote   = null
    } else if (userVote !== null) {
      // Switch vote
      optimisticCount += type === 'upvote' ? 2 : -2
    } else {
      // Fresh vote
      optimisticCount += type === 'upvote' ? 1 : -1
    }
    onVoteUpdate(optimisticCount, optimisticVote)

    // ── API call ──────────────────────────────────────────────────────
    setLoading(true)
    try {
      const res = await voteApi.vote(postId, type)
      // Confirm with server's actual count
      onVoteUpdate(res.data.new_vote_count, res.data.user_vote)
    } catch (err) {
      // Revert optimistic update on failure
      onVoteUpdate(voteCount, userVote)
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const isVertical = orientation === 'vertical'

  return (
    <div className={`
      flex items-center gap-1
      ${isVertical ? 'flex-col' : 'flex-row'}
    `}>

      {/* ── Upvote ── */}
      <button
        onClick={() => handleVote('upvote')}
        disabled={loading}
        title={isLoggedIn ? 'Upvote' : 'Login to vote'}
        className={`
          p-1.5 rounded-lg transition-all duration-150
          disabled:opacity-60 disabled:cursor-not-allowed
          ${userVote === 'upvote'
            ? 'text-orange-400 bg-orange-500/15 hover:bg-orange-500/25'
            : 'text-zinc-500 hover:text-orange-400 hover:bg-orange-500/10'
          }
        `}
      >
        <ChevronUp size={18} strokeWidth={2.5} />
      </button>

      {/* ── Vote count ── */}
      <span className={`
        text-xs font-bold min-w-[24px] text-center leading-none
        ${voteCount > 0
          ? 'text-orange-400'
          : voteCount < 0
          ? 'text-indigo-400'
          : 'text-zinc-500'
        }
      `}>
        {formatVoteCount(voteCount)}
      </span>

      {/* ── Downvote ── */}
      <button
        onClick={() => handleVote('downvote')}
        disabled={loading}
        title={isLoggedIn ? 'Downvote' : 'Login to vote'}
        className={`
          p-1.5 rounded-lg transition-all duration-150
          disabled:opacity-60 disabled:cursor-not-allowed
          ${userVote === 'downvote'
            ? 'text-indigo-400 bg-indigo-500/15 hover:bg-indigo-500/25'
            : 'text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10'
          }
        `}
      >
        <ChevronDown size={18} strokeWidth={2.5} />
      </button>

    </div>
  )
}
