'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn } from 'lucide-react'

import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'
import { AuthToken } from '@/types'
import AuthFormWrapper from '@/components/auth/AuthFormWrapper'
import { Button, Input } from '@/components/ui'

export default function LoginPage() {
  const router   = useRouter()
  const { login } = useAuth()

  // ── Form state ────────────────────────────────────────────────────────
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState<{ email?: string; password?: string }>({})

  // ── Client-side validation ────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim())           e.email    = 'Email is required'
    else if (!email.includes('@')) e.email  = 'Enter a valid email'
    if (!password)               e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit handler ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res  = await authApi.login({ email, password })
      const data = res.data as AuthToken

      // Save token + user in context (also persists to localStorage)
      login(data.access_token, data.user)

      toast.success(`Welcome back, ${data.user.username}!`)
      router.push('/')           // redirect to home feed
      router.refresh()

    } catch (err) {
      const msg = getErrorMessage(err)
      // Show field-level error for auth failures
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('password')) {
        setErrors({ password: msg })
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFormWrapper
      title="Welcome back"
      subtitle="Sign in to your ThreadFire account"
      footerText="Don't have an account?"
      footerLink="/register"
      footerLabel="Sign up free"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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
          autoFocus
        />

        {/* ── Password ── */}
        <div className="relative">
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            placeholder="Your password"
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
            }}
            error={errors.password}
            autoComplete="current-password"
          />
          {/* Show/hide password toggle */}
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-300 transition-colors"
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* ── Submit ── */}
        <Button
          type="submit"
          loading={loading}
          className="w-full mt-1 gap-2"
          size="lg"
        >
          <LogIn size={16} />
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

      </form>
    </AuthFormWrapper>
  )
}
