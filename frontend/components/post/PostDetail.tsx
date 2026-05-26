'use client'

import Link from 'next/link'
import { Trash2, ExternalLink, FileText, Link2, Image as ImageIcon } from 'lucide-react'
import { Post } from '@/types'
import { timeAgo, getErrorMessage } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { postApi } from '@/lib/api'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// ── Post type badge ───────────────────────────────────────────────────────
const TYPE_CONFIG = {
  text:  { icon: <FileText  size={11} />, label: 'Text',  color: 'text-zinc-400'  },
  link:  { icon: <Link2     size={11} />, label: 'Link',  color: 'text-blue-400'  },
  image: { icon: <ImageIcon size={11} />, label: 'Image', color: 'text-green-400' },
}

interface PostDetailProps {
  post: Post
}

export default function PostDetail({ post }: PostDetailProps) {
  const router             = useRouter()
  const { user }           = useAuth()
  const [deleting, setDeleting] = useState(false)
  const isAuthor           = user?.id === post.author_id
  const typeConfig         = TYPE_CONFIG[post.post_type]

  const handleDelete = async () => {
    if (!confirm('Delete this post? All comments will also be removed.')) return
    setDeleting(true)
    try {
      await postApi.delete(post.id)
      toast.success('Post deleted')
      router.push(`/communities/${post.community.name}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">

      {/* ── Meta row ── */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 mb-3">
        <Link
          href={`/communities/${post.community.name}`}
          className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
        >
          r/{post.community.name}
        </Link>
        <span>·</span>
        <span>Posted by u/{post.author.username}</span>
        <span>·</span>
        <span>{timeAgo(post.created_at)}</span>
        <span>·</span>
        <span className={`flex items-center gap-1 ${typeConfig.color}`}>
          {typeConfig.icon}
          {typeConfig.label}
        </span>
      </div>

      {/* ── Title ── */}
      <h1 className="text-xl font-bold text-zinc-100 leading-snug mb-4">
        {post.title}
      </h1>

      {/* ── Content by type ── */}
      {post.post_type === 'text' && post.content && (
        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-800/40 rounded-lg p-4 mb-4">
          {post.content}
        </div>
      )}

      {post.post_type === 'link' && post.content && (
        <a
          href={post.content}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-zinc-800/40 rounded-lg px-4 py-2.5 mb-4 transition-colors group"
        >
          <Link2 size={14} />
          <span className="truncate max-w-xs">{post.content}</span>
          <ExternalLink size={12} className="flex-shrink-0 opacity-60 group-hover:opacity-100" />
        </a>
      )}

      {post.post_type === 'image' && post.content && (
        <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.content}
            alt={post.title}
            className="max-w-full max-h-[500px] object-contain bg-zinc-800"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* ── Footer row: stats + delete ── */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <div className="text-xs text-zinc-600">
          {post.comment_count === 1 ? '1 comment' : `${post.comment_count} comments`}
        </div>
        {isAuthor && (
          <Button
            variant="ghost"
            size="sm"
            loading={deleting}
            onClick={handleDelete}
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={13} />
            Delete post
          </Button>
        )}
      </div>

    </article>
  )
}
