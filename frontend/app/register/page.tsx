'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, UserPlus, CheckCircle, XCircle } from 'lucide-react'

import { authApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import AuthFormWrapper from '@/components/auth/AuthFormWrapper'
import { Button, Input } from '@/components/ui'

// ── Password strength rules ───────────────────────────────────────────────
const rules = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a letter',     test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: 'Contains a number',     test: (p: string) => /\d/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()

  // ── Form state ────────────────────────────────────────────────────────
  const [username,  setUsername]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState<{
    username?: string
    email?: string
    password?: string
  }>({})

  // ── Password strength indicator ───────────────────────────────────────
  const passStrength = rules.filter(r => r.test(password)).length
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][passStrength]
  const strengthColor = ['', 'text-red-400', 'text-yellow-400', 'text-green-400'][passStrength]

  // ── Client-side validation ────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {}

    if (!username.trim())
      e.username = 'Username is required'
    else if (username.length < 3)
      e.username = 'Username must be at least 3 characters'
    else if (username.length > 50)
      e.username = 'Username must be under 50 characters'
    else if (!/^[a-zA-Z0-9_-]+$/.test(username))
      e.username = 'Only letters, numbers, _ and - allowed'

    if (!email.trim())
      e.email = 'Email is required'
    else if (!email.includes('@'))
      e.email = 'Enter a valid email address'

    if (!password)
      e.password = 'Password is required'
    else if (password.length < 6)
      e.password = 'Password must be at least 6 characters'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit handler ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await authApi.register({ username, email, password })

      toast.success('Account created! Please sign in.')
      router.push('/login')   // redirect to login after successful registration

    } catch (err) {
      const msg = getErrorMessage(err)

      // Map backend error messages to specific fields
      if (msg.toLowerCase().includes('username'))
        setErrors(prev => ({ ...prev, username: msg }))
      else if (msg.toLowerCase().includes('email'))
        setErrors(prev => ({ ...prev, email: msg }))
      else
        toast.error(msg)

    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormWrapper
      title="Create your account"
      subtitle="Join ThreadFire and start discussing"
      footerText="Already have an account?"
      footerLink="/login"
      footerLabel="Sign in"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── Username ── */}
        <Input
          label="Username"
          type="text"
          placeholder="e.g. john_doe"
          value={username}
          onChange={e => {
            setUsername(e.target.value)
            if (errors.username) setErrors(prev => ({ ...prev, username: undefined }))
          }}
          error={errors.username}
          helper="3–50 characters. Letters, numbers, _ and - only."
          autoComplete="username"
          autoFocus
        />

        {/* ── Email ── */}
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
          }}
          error={errors.email}
          autoComplete="email"
        />

        {/* ── Password ── */}
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
              }}
              error={errors.password}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* ── Password strength indicator ── */}
          {password.length > 0 && (
            <div className="mt-1 space-y-1.5">

              {/* Strength bar */}
              <div className="flex gap-1">
                {[1, 2, 3].map(level => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passStrength >= level
                        ? level === 1 ? 'bg-red-400'
                          : level === 2 ? 'bg-yellow-400'
                          : 'bg-green-400'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>

              {/* Strength label */}
              {strengthLabel && (
                <p className={`text-xs font-medium ${strengthColor}`}>
                  {strengthLabel} password
                </p>
              )}

              {/* Rule checklist */}
              <ul className="space-y-1">
                {rules.map(rule => {
                  const passed = rule.test(password)
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        passed ? 'text-green-400' : 'text-zinc-500'
                      }`}
                    >
                      {passed
                        ? <CheckCircle size={11} />
                        : <XCircle    size={11} />
                      }
                      {rule.label}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* ── Terms note ── */}
        <p className="text-xs text-zinc-600 text-center -mb-1">
          By signing up you agree to our Terms of Service.
        </p>

        {/* ── Submit ── */}
        <Button
          type="submit"
          loading={loading}
          className="w-full gap-2"
          size="lg"
        >
          <UserPlus size={16} />
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

      </form>
    </AuthFormWrapper>
  )
}
