'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Hash, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import { communityApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Textarea, Card } from '@/components/ui'

const MAX_NAME = 100
const MAX_DESC = 500

export default function CreateCommunityPage() {
  const router      = useRouter()
  const { isLoggedIn } = useAuth()

  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState<{ name?: string; description?: string }>({})

  // ── Name rules (mirrors backend validation) ───────────────────────────
  const nameRules = [
    { label: 'At least 3 characters',          pass: name.length >= 3 },
    { label: 'Under 100 characters',           pass: name.length <= MAX_NAME },
    { label: 'Letters, numbers, _ and - only', pass: /^[a-zA-Z0-9_-]*$/.test(name) },
  ]
  const nameValid = name.length > 0 && nameRules.every(r => r.pass)

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim())
      e.name = 'Community name is required'
    else if (name.length < 3)
      e.name = 'Name must be at least 3 characters'
    else if (!/^[a-zA-Z0-9_-]+$/.test(name))
      e.name = 'Only letters, numbers, _ and - allowed'

    if (description.length > MAX_DESC)
      e.description = `Description must be under ${MAX_DESC} characters`

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await communityApi.create({
        name: name.toLowerCase(),
        description: description.trim() || undefined,
      })
      toast.success(`r/${res.data.name} created!`)
      router.push(`/communities/${res.data.name}`)
    } catch (err) {
      const msg = getErrorMessage(err)
      if (msg.toLowerCase().includes('already exist') || msg.toLowerCase().includes('name'))
        setErrors(prev => ({ ...prev, name: msg }))
      else
        toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Guard: not logged in ──────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Hash size={48} className="text-zinc-700 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-zinc-300 mb-2">
          Login required
        </h2>
        <p className="text-zinc-500 text-sm mb-6">
          You need to be logged in to create a community.
        </p>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">

      {/* ── Back link ── */}
      <Link
        href="/communities"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Communities
      </Link>

      <h1 className="text-2xl font-bold text-zinc-100 mb-1">Create Community</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Build a place for people to share and discuss topics you care about.
      </p>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* ── Name field ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">
              Community Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">
                r/
              </span>
              <input
                type="text"
                placeholder="mycommunity"
                value={name}
                maxLength={MAX_NAME}
                onChange={e => {
                  setName(e.target.value)
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                }}
                className={`
                  w-full bg-zinc-800 border rounded-lg pl-8 pr-4 py-2.5
                  text-sm text-zinc-100 placeholder:text-zinc-600
                  focus:outline-none focus:ring-2 focus:ring-orange-500/40
                  transition-colors
                  ${errors.name ? 'border-red-500' : 'border-zinc-700 focus:border-orange-500/40'}
                `}
                autoFocus
                autoComplete="off"
              />
            </div>

            {/* Name rules checklist */}
            {name.length > 0 && (
              <ul className="space-y-1 mt-1">
                {nameRules.map(rule => (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      rule.pass ? 'text-green-400' : 'text-zinc-500'
                    }`}
                  >
                    <CheckCircle size={11} className={rule.pass ? 'text-green-400' : 'text-zinc-700'} />
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name}</p>
            )}
            <p className="text-xs text-zinc-600">
              {name.length}/{MAX_NAME} · Names are permanent and case-insensitive.
            </p>
          </div>

          {/* ── Description field ── */}
          <div className="flex flex-col gap-1.5">
            <Textarea
              label="Description"
              placeholder="What is this community about? (optional)"
              value={description}
              rows={4}
              maxLength={MAX_DESC}
              onChange={e => {
                setDescription(e.target.value)
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
              }}
              error={errors.description}
            />
            <p className="text-xs text-zinc-600 text-right">
              {description.length}/{MAX_DESC}
            </p>
          </div>

          {/* ── Preview ── */}
          {name.length >= 3 && nameValid && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <Hash size={14} className="text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  r/{name.toLowerCase()}
                </p>
                {description && (
                  <p className="text-xs text-zinc-500 line-clamp-1">{description}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Submit ── */}
          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              loading={loading}
              disabled={!nameValid}
              className="flex-1"
              size="lg"
            >
              {loading ? 'Creating…' : 'Create Community'}
            </Button>
            <Link href="/communities">
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
