import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, SquareTerminal as TerminalSquare, Wand as Wand2 } from 'lucide-react'

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
          'If email confirmation is enabled, check your inbox before signing in.',
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
    'bg-[radial-gradient(ellipse_80%_50%_at_12%_10%,rgba(99,102,241,0.1),transparent),radial-gradient(ellipse_60%_50%_at_88%_8%,rgba(56,189,248,0.06),transparent),#030305] text-white'

  const panelClassName = 'border-white/[0.06] bg-white/[0.02] text-white shadow-2xl shadow-black/40'

  const inputClassName =
    'border-white/[0.06] bg-white/[0.02] text-white placeholder:text-zinc-600 focus:border-violet-500/40 focus:bg-white/[0.04]'

  const modeToggleItemClass = (active: boolean) =>
    [
      'min-w-0 rounded-lg px-3 py-2.5 text-xs font-medium transition-all sm:px-4 sm:text-[13px]',
      active
        ? 'bg-white/[0.07] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
        : 'text-zinc-500 hover:text-zinc-200',
    ].join(' ')

  return (
    <div className={`min-h-screen ${shellClassName}`}>
      <div className='grid min-h-screen lg:grid-cols-2'>
        <section className='relative hidden overflow-hidden border-r border-white/[0.03] lg:flex'>
          <div className='relative z-10 flex w-full flex-col justify-between p-12 xl:p-16'>
            <div className='flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/10 text-white ring-1 ring-white/[0.08]'>
                <Sparkles className='h-5 w-5' />
              </div>
              <div>
                <h1 className='text-xl font-semibold tracking-tight text-zinc-100'>Mardakhay Labs</h1>
                <p className='text-[10px] font-medium uppercase tracking-[0.32em] text-zinc-500'>
                  AI prompt workspace
                </p>
              </div>
            </div>

            <div className='max-w-xl'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.34em] text-violet-300/80'>
                Product-first workspace
              </p>
              <h2 className='mt-4 text-4xl font-semibold tracking-tight leading-[1.1] text-zinc-100 xl:text-5xl'>
                Keep your prompts organized in one calm place.
              </h2>
              <p className='mt-5 max-w-lg text-[15px] leading-7 text-zinc-400'>
                Sign in to access your prompt library, favorites, and workspace tools
                with a stable dark interface designed to stay out of your way.
              </p>

              <div className='mt-8 flex flex-wrap gap-2.5'>
                <span className='inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-zinc-300'>
                  <TerminalSquare className='h-3.5 w-3.5 text-zinc-400' />
                  Secure workspace
                </span>
                <span className='inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-zinc-300'>
                  <Wand2 className='h-3.5 w-3.5 text-zinc-400' />
                  Prompt tools
                </span>
                <span className='inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-zinc-300'>
                  <ShieldCheck className='h-3.5 w-3.5 text-zinc-400' />
                  Supabase Auth
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className='flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-10'>
          <div className={`w-full min-w-0 max-w-[22rem] overflow-hidden rounded-2xl border p-5 sm:max-w-md sm:p-8 ${panelClassName}`}>
            <div className='mb-7 flex items-start justify-between gap-4 sm:mb-8'>
              <div className='min-w-0'>
                <p className='text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500 sm:tracking-[0.3em]'>
                  Secure access
                </p>
                <h2 className='mt-2 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-[28px]'>
                  {heading}
                </h2>
                <p className='mt-2 text-sm leading-6 text-zinc-400'>{description}</p>
              </div>

              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/10 text-violet-200 ring-1 ring-white/[0.06]'>
                <Sparkles className='h-4 w-4' />
              </div>
            </div>

            <div className='mb-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] rounded-xl border border-white/[0.06] bg-white/[0.02] p-1'>
              <button
                type='button'
                aria-pressed={!isSignup}
                onClick={() => setIsSignup(false)}
                className={`${modeToggleItemClass(!isSignup)} min-h-10`}
              >
                Sign in
              </button>
              <button
                type='button'
                aria-pressed={isSignup}
                onClick={() => setIsSignup(true)}
                className={`${modeToggleItemClass(isSignup)} min-h-10`}
              >
                Create account
              </button>
            </div>

            <form className='space-y-4' onSubmit={handleAuth}>
              <label className='block space-y-2'>
                <span className='text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500'>
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
                  className={`min-h-11 w-full rounded-xl border px-4 py-3 text-[13px] outline-none transition-colors ${inputClassName}`}
                />
              </label>

              <label className='block space-y-2'>
                <span className='text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500'>
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
                    className={`min-h-11 w-full rounded-xl border px-4 py-3 pr-12 text-[13px] outline-none transition-colors ${inputClassName}`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className='absolute inset-y-0 right-1 flex min-w-10 items-center justify-center rounded-lg px-3 text-zinc-500 transition-colors hover:text-zinc-200'
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
                className='inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 px-4 py-3 text-[13px] font-semibold text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_2px_8px_rgba(139,92,246,0.15)] transition-all hover:from-violet-400 hover:to-violet-500 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.4),0_4px_16px_rgba(139,92,246,0.2)] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSubmitting ? (isSignup ? 'Creating...' : 'Signing in...') : isSignup ? 'Create account' : 'Sign in'}
                <ArrowRight className='h-4 w-4' />
              </button>
            </form>

            <p className='mt-6 text-xs leading-6 uppercase tracking-[0.18em] text-zinc-500 sm:tracking-[0.26em]'>
              By continuing, you agree to the terms of service and privacy policy.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
