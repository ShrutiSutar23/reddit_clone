'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Trash2, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { Comment } from '@/types'
import { commentApi } from '@/lib/api'
import { timeAgo, getErrorMessage } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Button, Spinner } from '@/components/ui'
import Link from 'next/link'

interface CommentSectionProps {
  postId:               number
  commentCount:         number
  onCommentCountChange: (count: number) => void
}

export default function CommentSection({
  postId,
  commentCount,
  onCommentCountChange,
}: CommentSectionProps) {
  const { isLoggedIn, user } = useAuth()

  const [comments,    setComments]    = useState<Comment[]>([])
  const [loading,     setLoading]     = useState(true)
  const [newComment,  setNewComment]  = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [deletingId,  setDeletingId]  = useState<number | null>(null)
  const [charCount,   setCharCount]   = useState(0)

  // ── Fetch comments ────────────────────────────────────────────────────
  useEffect(() => {
    commentApi.list(postId)
      .then(res => setComments(res.data.comments))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postId])

  // ── Add comment ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const trimmed = newComment.trim()
    if (!trimmed) return
    if (trimmed.length > 1000) {
      toast.error('Comment must be under 1,000 characters')
      return
    }

    setSubmitting(true)
    try {
      const res        = await commentApi.add(postId, trimmed)
      const newCount   = commentCount + 1
      setComments(prev => [...prev, res.data])
      onCommentCountChange(newCount)
      setNewComment('')
      setCharCount(0)
      toast.success('Comment added')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete comment ────────────────────────────────────────────────────
  const handleDelete = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return
    setDeletingId(commentId)
    try {
      await commentApi.delete(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      const newCount = Math.max(0, commentCount - 1)
      onCommentCountChange(newCount)
      toast.success('Comment deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare size={16} className="text-zinc-500" />
        <h2 className="text-sm font-semibold text-zinc-300">
          {commentCount === 1 ? '1 Comment' : `${commentCount} Comments`}
        </h2>
      </div>

      {/* ── Add comment form ── */}
      {isLoggedIn ? (
        <div className="mb-6">
          <p className="text-xs text-zinc-500 mb-2">
            Commenting as <span className="text-orange-400">u/{user?.username}</span>
          </p>
          <textarea
            value={newComment}
            onChange={e => {
              setNewComment(e.target.value)
              setCharCount(e.target.value.length)
            }}
            onKeyDown={e => {
              // Ctrl+Enter or Cmd+Enter to submit
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit()
            }}
            placeholder="What are your thoughts?"
            rows={3}
            maxLength={1000}
            className="
              w-full bg-zinc-800 border border-zinc-700 rounded-lg
              px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-orange-500/40
              focus:border-orange-500/40 transition-all resize-none
            "
          />
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${charCount > 900 ? 'text-orange-400' : 'text-zinc-600'}`}>
              {charCount}/1000 · Ctrl+Enter to submit
            </span>
            <Button
              size="sm"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!newComment.trim()}
            >
              <Send size={13} />
              Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
          <p className="text-sm text-zinc-400 mb-2">Join the discussion</p>
          <div className="flex items-center justify-center gap-2">
            <Link href="/login">
              <Button size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" variant="secondary">Sign up</Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Comments list ── */}
      {loading ? (
        <Spinner size={18} />
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare size={32} className="text-zinc-700 mx-auto mb-2" />
          <p className="text-sm text-zinc-600">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="flex gap-3 group"
            >
              {/* Avatar dot */}
              <div className="w-6 h-6 rounded-full bg-zinc-700 border border-zinc-600 flex-shrink-0 mt-0.5 flex items-center justify-center">
                <span className="text-[10px] text-zinc-400 font-bold">
                  {comment.author.username[0].toUpperCase()}
                </span>
              </div>

              {/* Comment body */}
              <div className="flex-1 min-w-0">
                {/* Author + time */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-zinc-300">
                    u/{comment.author.username}
                  </span>
                  {comment.is_owner && (
                    <span className="text-[10px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                      you
                    </span>
                  )}
                  <span className="text-xs text-zinc-600">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>

                {/* Content */}
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Delete button (owner only) */}
                {comment.is_owner && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="
                      mt-1.5 flex items-center gap-1 text-xs text-zinc-600
                      hover:text-red-400 transition-colors opacity-0
                      group-hover:opacity-100 disabled:opacity-40
                    "
                  >
                    <Trash2 size={11} />
                    {deletingId === comment.id ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
