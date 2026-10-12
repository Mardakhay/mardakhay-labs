import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wand2,
} from 'lucide-react'

import { signIn, signUp } from '../api/auth'
import { useNotificationStore } from '../stores/notificationStore'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showNotification } = useNotificationStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const heading = isSignup ? 'Create account' : 'Welcome back'
  const description = isSignup
    ? 'Create a secure account to keep your prompts, favorites, and workspace in sync.'
    : 'Sign in to continue to your calm prompt workspace and keep everything synced.'

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (isSignup && password.trim().length < 8) {
      showNotification('Use at least 8 characters for your password.', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const authResult = isSignup
        ? await signUp(email.trim(), password)
        : await signIn(email.trim(), password)

      if (isSignup && !authResult.session) {
        showNotification(
          'Check your email to confirm your account before logging in.',
          'info'
        )
        setIsSignup(false)
        return
      }

      showNotification(
        isSignup ? 'Account created successfully.' : 'Welcome back to Mardakhay Labs.',
        'success'
      )

      navigate(fromPath, { replace: true })
    } catch (error) {
      console.error(error)
      showNotification('Authentication failed. Check your credentials and try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const shellClassName =
    'bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_28%),#09090b] text-white'

  const panelClassName = 'border-white/10 bg-white/5 text-white shadow-2xl shadow-black/20'

  const inputClassName =
    'border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:bg-white/[0.07]'

  const modeToggleItemClass = (active: boolean) =>
    [
      'rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
      active
        ? 'bg-white/10 text-white shadow-sm shadow-black/10'
        : 'text-zinc-400 hover:text-white',
    ].join(' ')

  return (
    <div className={`min-h-screen ${shellClassName}`}>
      <div className='grid min-h-screen lg:grid-cols-2'>
        <section className='relative hidden overflow-hidden border-r border-white/5 lg:flex'>
          <div className='relative z-10 flex w-full flex-col justify-between p-12 xl:p-16'>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-500/20'>
                <Sparkles className='h-5 w-5' />
              </div>
              <div>
                <h1 className='text-2xl font-semibold tracking-tight'>Mardakhay Labs</h1>
                <p className='text-xs uppercase tracking-[0.3em] text-zinc-400'>
                  AI prompt workspace
                </p>
              </div>
            </div>

            <div className='max-w-xl'>
              <p className='text-xs font-semibold uppercase tracking-[0.32em] text-violet-200'>
                Product-first workspace
              </p>
              <h2 className='mt-4 text-5xl font-semibold tracking-tight xl:text-6xl'>
                Keep your prompts organized in one calm place.
              </h2>
              <p className='mt-5 max-w-lg text-base leading-7 text-zinc-300'>
                Sign in to access your prompt library, favorites, and workspace tools
                with a stable dark interface designed to stay out of your way.
              </p>

              <div className='mt-8 flex flex-wrap gap-3'>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200'>
                  <TerminalSquare className='h-3.5 w-3.5' />
                  Secure workspace
                </span>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200'>
                  <Wand2 className='h-3.5 w-3.5' />
                  Prompt tools
                </span>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200'>
                  <ShieldCheck className='h-3.5 w-3.5' />
                  Supabase Auth
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className='flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10'>
          <div className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 ${panelClassName}`}>
            <div className='mb-8 flex items-start justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.3em] text-zinc-500'>
                  Secure access
                </p>
                <h2 className='mt-2 text-3xl font-semibold tracking-tight'>{heading}</h2>
                <p className='mt-2 text-sm leading-6 text-zinc-400'>{description}</p>
              </div>

              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200'>
                <Sparkles className='h-5 w-5' />
              </div>
            </div>

            <div className='mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1'>
              <button
                type='button'
                aria-pressed={!isSignup}
                onClick={() => setIsSignup(false)}
                className={modeToggleItemClass(!isSignup)}
              >
                Sign in
              </button>
              <button
                type='button'
                aria-pressed={isSignup}
                onClick={() => setIsSignup(true)}
                className={modeToggleItemClass(isSignup)}
              >
                Create account
              </button>
            </div>

            <form className='space-y-4' onSubmit={handleAuth}>
              <label className='block space-y-2'>
                <span className='text-xs font-medium uppercase tracking-[0.28em] text-zinc-500'>
                  Email address
                </span>
                <input
                  type='email'
                  placeholder='name@company.com'
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete='email'
                  spellCheck='false'
                  autoCapitalize='none'
                  required
                  disabled={isSubmitting}
                  className={`w-full rounded-2xl border px-4 py-3.5 text-sm outline-none transition-colors ${inputClassName}`}
                />
              </label>

              <label className='block space-y-2'>
                <span className='text-xs font-medium uppercase tracking-[0.28em] text-zinc-500'>
                  Password
                </span>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                    disabled={isSubmitting}
                    className={`w-full rounded-2xl border px-4 py-3.5 pr-12 text-sm outline-none transition-colors ${inputClassName}`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className='absolute inset-y-0 right-1 flex items-center justify-center rounded-xl px-3 text-zinc-400 transition-colors hover:text-white'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                <p className='text-xs leading-5 text-zinc-500'>
                  {isSignup
                    ? 'Use at least 8 characters for a stronger workspace account.'
                    : 'Keep your password private. You can show it with the eye icon.'}
                </p>
              </label>

              <button
                type='submit'
                disabled={isSubmitting}
                className='inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-70'
              >
                {isSubmitting ? (isSignup ? 'Creating...' : 'Signing in...') : isSignup ? 'Create account' : 'Sign in'}
                <ArrowRight className='h-4 w-4' />
              </button>
            </form>

            <p className='mt-6 text-xs leading-6 uppercase tracking-[0.26em] text-zinc-500'>
              By continuing, you agree to the terms of service and privacy policy.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
