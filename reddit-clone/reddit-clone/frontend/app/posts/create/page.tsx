'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Link2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

import { postApi, communityApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Community, PostType } from '@/types'
import { Button, Input, Textarea, Card } from '@/components/ui'

// ── Post type tabs config ─────────────────────────────────────────────────
const POST_TYPES: { type: PostType; label: string; icon: React.ReactNode }[] = [
  { type: 'text',  label: 'Text',  icon: <FileText   size={14} /> },
  { type: 'link',  label: 'Link',  icon: <Link2      size={14} /> },
  { type: 'image', label: 'Image', icon: <ImageIcon  size={14} /> },
]

export default function CreatePostPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn } = useAuth()

  // Pre-fill community from URL param: /posts/create?community=cricket
  const prefilledCommunity = searchParams.get('community') || ''

  // ── Form state ────────────────────────────────────────────────────────
  const [postType,    setPostType]    = useState<PostType>('text')
  const [title,       setTitle]       = useState('')
  const [content,     setContent]     = useState('')
  const [communityId, setCommunityId] = useState<number | ''>('')
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading,     setLoading]     = useState(false)
  const [loadingComm, setLoadingComm] = useState(true)
  const [errors,      setErrors]      = useState<{
    title?: string; content?: string; community?: string
  }>({})

  // ── Load communities for dropdown ─────────────────────────────────────
  useEffect(() => {
    communityApi.list({ per_page: 50 })
      .then(res => {
        const comms: Community[] = res.data.communities
        setCommunities(comms)
        // Pre-select community from URL param
        if (prefilledCommunity) {
          const match = comms.find(c => c.name === prefilledCommunity.toLowerCase())
          if (match) setCommunityId(match.id)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingComm(false))
  }, [prefilledCommunity])

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {}

    if (!title.trim())
      e.title = 'Title is required'
    else if (title.length < 3)
      e.title = 'Title must be at least 3 characters'
    else if (title.length > 300)
      e.title = 'Title must be under 300 characters'

    if (postType === 'link' || postType === 'image') {
      if (!content.trim())
        e.content = `${postType === 'link' ? 'Link' : 'Image'} URL is required`
      else if (!content.startsWith('http'))
        e.content = 'Must be a valid URL starting with http'
    }

    if (!communityId)
      e.community = 'Please select a community'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await postApi.create({
        title:        title.trim(),
        content:      content.trim() || undefined,
        post_type:    postType,
        community_id: communityId as number,
      })
      toast.success('Post created!')
      router.push(`/posts/${res.data.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // ── Guard: not logged in ──────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <FileText size={48} className="text-zinc-700 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-zinc-300 mb-2">Login required</h2>
        <p className="text-zinc-500 text-sm mb-6">You must be logged in to create a post.</p>
        <Link href="/login"><Button>Sign in</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Back link ── */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to feed
      </Link>

      <h1 className="text-2xl font-bold text-zinc-100 mb-1">Create Post</h1>
      <p className="text-zinc-500 text-sm mb-6">Share something with the community.</p>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* ── Post type tabs ── */}
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">Post Type</label>
            <div className="flex bg-zinc-800 rounded-xl p-1 gap-1">
              {POST_TYPES.map(({ type, label, icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setPostType(type)
                    setContent('')
                    setErrors(prev => ({ ...prev, content: undefined }))
                  }}
                  className={`
                    flex-1 flex items-center justify-center gap-2
                    py-2 px-3 rounded-lg text-sm font-medium transition-all
                    ${postType === type
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                    }
                  `}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Community selector ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Community</label>
            <select
              value={communityId}
              onChange={e => {
                setCommunityId(e.target.value ? Number(e.target.value) : '')
                if (errors.community) setErrors(prev => ({ ...prev, community: undefined }))
              }}
              className={`
                w-full bg-zinc-900 border rounded-lg px-3 py-2.5 text-sm text-zinc-100
                focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors
                ${errors.community ? 'border-red-500' : 'border-zinc-700 focus:border-orange-500/40'}
              `}
              disabled={loadingComm}
            >
              <option value="">
                {loadingComm ? 'Loading communities…' : '— Select a community —'}
              </option>
              {communities.map(c => (
                <option key={c.id} value={c.id}>
                  r/{c.name}
                </option>
              ))}
            </select>
            {errors.community && (
              <p className="text-xs text-red-400">{errors.community}</p>
            )}
            {communities.length === 0 && !loadingComm && (
              <p className="text-xs text-zinc-500">
                No communities yet.{' '}
                <Link href="/communities/create" className="text-orange-400 hover:text-orange-300">
                  Create one first →
                </Link>
              </p>
            )}
          </div>

          {/* ── Title ── */}
          <div className="flex flex-col gap-1.5">
            <Input
              label="Title"
              type="text"
              placeholder="An interesting title…"
              value={title}
              maxLength={300}
              onChange={e => {
                setTitle(e.target.value)
                if (errors.title) setErrors(prev => ({ ...prev, title: undefined }))
              }}
              error={errors.title}
            />
            <p className="text-xs text-zinc-600 text-right">{title.length}/300</p>
          </div>

          {/* ── Content – changes based on post type ── */}
          {postType === 'text' && (
            <div className="flex flex-col gap-1.5">
              <Textarea
                label="Content"
                placeholder="Share your thoughts… (optional for text posts)"
                value={content}
                rows={6}
                onChange={e => setContent(e.target.value)}
              />
              <p className="text-xs text-zinc-600 text-right">{content.length}/40000</p>
            </div>
          )}

          {postType === 'link' && (
            <Input
              label="Link URL"
              type="url"
              placeholder="https://example.com/article"
              value={content}
              onChange={e => {
                setContent(e.target.value)
                if (errors.content) setErrors(prev => ({ ...prev, content: undefined }))
              }}
              error={errors.content}
              helper="Paste the full URL including https://"
            />
          )}

          {postType === 'image' && (
            <Input
              label="Image URL"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={content}
              onChange={e => {
                setContent(e.target.value)
                if (errors.content) setErrors(prev => ({ ...prev, content: undefined }))
              }}
              error={errors.content}
              helper="Paste a direct link to an image"
            />
          )}

          {/* Image preview */}
          {postType === 'image' && content.startsWith('http') && (
            <div className="rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content}
                alt="Preview"
                className="max-h-48 w-full object-contain"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}

          {/* ── Submit ── */}
          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="flex-1"
            >
              {loading ? 'Posting…' : 'Create Post'}
            </Button>
            <Link href="/">
              <Button type="button" variant="secondary" size="lg">
                Cancel
              </Button>
            </Link>
          </div>

        </form>
      </Card>
    </div>
  )
}
