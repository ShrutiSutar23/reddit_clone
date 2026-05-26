'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Hash, PlusCircle, Trash2, Calendar, FileText } from 'lucide-react'
import { Community } from '@/types'
import { communityApi } from '@/lib/api'
import { timeAgo, getErrorMessage } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import PostFeed from '@/components/post/PostFeed'
import { Spinner, Button, Card } from '@/components/ui'
import toast from 'react-hot-toast'

export default function CommunityDetailPage() {
  const { name }              = useParams<{ name: string }>()
  const router                = useRouter()
  const { user, isLoggedIn }  = useAuth()

  const [community,  setCommunity]  = useState<Community | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [deleting,   setDeleting]   = useState(false)
  const [notFound,   setNotFound]   = useState(false)

  // ── Fetch community details ───────────────────────────────────────────
  useEffect(() => {
    if (!name) return
    communityApi.get(name)
      .then(res => setCommunity(res.data))
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [name])

  // ── Delete community ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!community) return
    if (!confirm(`Delete r/${community.name}? All posts will also be deleted.`)) return

    setDeleting(true)
    try {
      await communityApi.delete(community.name)
      toast.success(`r/${community.name} deleted`)
      router.push('/communities')
    } catch (err) {
      toast.error(getErrorMessage(err))
      setDeleting(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) return <Spinner />

  // ── Not found ─────────────────────────────────────────────────────────
  if (notFound || !community) {
    return (
      <div className="text-center py-20">
        <Hash size={48} className="text-zinc-700 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-zinc-300 mb-2">
          Community not found
        </h1>
        <p className="text-zinc-500 text-sm mb-6">
          r/{name} does not exist or has been deleted.
        </p>
        <Link href="/communities">
          <Button variant="secondary">Browse Communities</Button>
        </Link>
      </div>
    )
  }

  const isCreator = user?.id === community.created_by

  return (
    <div className="flex gap-6">

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">

        {/* Community banner */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center flex-shrink-0">
                <Hash size={20} className="text-orange-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100">
                  r/{community.name}
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Created by u/{community.creator.username} · {timeAgo(community.created_at)}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isLoggedIn && (
                <Link href={`/posts/create?community=${community.name}`}>
                  <Button size="sm">
                    <PlusCircle size={13} />
                    Post
                  </Button>
                </Link>
              )}
              {isCreator && (
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleting}
                  onClick={handleDelete}
                >
                  <Trash2 size={13} />
                  Delete
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              {community.description}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <FileText size={12} />
              <span>
                <span className="text-zinc-300 font-medium">{community.post_count}</span>
                {' '}{community.post_count === 1 ? 'post' : 'posts'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Calendar size={12} />
              <span>Created {timeAgo(community.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Post feed filtered to this community */}
        <PostFeed communityName={community.name} />
      </div>

      {/* ── Sidebar ── */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Card className="p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            About r/{community.name}
          </h3>
          {community.description ? (
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              {community.description}
            </p>
          ) : (
            <p className="text-sm text-zinc-600 italic mb-4">No description yet.</p>
          )}
          <div className="space-y-2 text-sm text-zinc-500">
            <div className="flex justify-between">
              <span>Posts</span>
              <span className="text-zinc-300 font-medium">{community.post_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Created by</span>
              <span className="text-orange-400">u/{community.creator.username}</span>
            </div>
          </div>
          {isLoggedIn && (
            <Link
              href={`/posts/create?community=${community.name}`}
              className="block mt-4"
            >
              <Button className="w-full" size="sm">
                <PlusCircle size={13} />
                Create Post
              </Button>
            </Link>
          )}
        </Card>
      </div>

    </div>
  )
}
