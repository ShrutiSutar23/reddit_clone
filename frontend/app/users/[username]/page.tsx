'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { User2, Calendar, FileText, MessageSquare } from 'lucide-react'
import { User, Post } from '@/types'
import { authApi, postApi } from '@/lib/api'
import { timeAgo } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import PostCard from '@/components/post/PostCard'
import { Spinner, Card, EmptyState } from '@/components/ui'

export default function UserProfilePage() {
  const { username }           = useParams<{ username: string }>()
  const { user: currentUser }  = useAuth()

  const [profile,  setProfile]  = useState<User | null>(null)
  const [posts,    setPosts]    = useState<Post[]>([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    if (!username) return
    Promise.all([
      authApi.getProfile(username),
      postApi.list({ per_page: 20 }),   // fetch all posts then filter by author
    ])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data)
        // Filter posts by this user
        const userPosts = postsRes.data.posts.filter(
          (p: Post) => p.author.username === username
        )
        setPosts(userPosts)
      })
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [username])

  if (loading) return <Spinner />

  if (notFound || !profile) {
    return (
      <div className="text-center py-20">
        <User2 size={48} className="text-zinc-700 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-zinc-300 mb-2">User not found</h1>
        <p className="text-zinc-500 text-sm">u/{username} does not exist.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6">

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold text-zinc-100 mb-4">
          Posts by u/{username}
        </h2>

        {posts.length === 0 ? (
          <EmptyState
            icon={<FileText size={40} />}
            title="No posts yet"
            description={
              isOwnProfile
                ? "You haven't posted anything yet."
                : `u/${username} hasn't posted anything yet.`
            }
            action={
              isOwnProfile ? (
                <Link
                  href="/posts/create"
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Create your first post →
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* ── Profile sidebar ── */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Card className="p-5">

          {/* Avatar */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-orange-400">
                {profile.username[0].toUpperCase()}
              </span>
            </div>
            <h2 className="font-bold text-zinc-100 text-lg">u/{profile.username}</h2>
            {isOwnProfile && (
              <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full mt-1">
                Your profile
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-3 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-500">
                <FileText size={13} />
                Posts
              </span>
              <span className="font-medium text-zinc-300">{posts.length}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-500">
                <Calendar size={13} />
                Joined
              </span>
              <span className="font-medium text-zinc-300">
                {timeAgo(profile.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-zinc-500">
                <MessageSquare size={13} />
                Status
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                profile.is_active
                  ? 'text-green-400 bg-green-400/10'
                  : 'text-red-400 bg-red-400/10'
              }`}>
                {profile.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Action for own profile */}
          {isOwnProfile && (
            <Link
              href="/posts/create"
              className="block mt-5 w-full text-center py-2 text-sm font-medium bg-orange-500 hover:bg-orange-400 text-white rounded-lg transition-colors"
            >
              Create Post
            </Link>
          )}
        </Card>
      </div>

    </div>
  )
}
