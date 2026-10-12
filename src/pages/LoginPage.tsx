import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  signIn,
  signUp,
} from '../api/auth'

import { useAuthStore }
  from '../stores/authStore'

function LoginPage() {
  const navigate = useNavigate()

  const { setUserEmail } =
    useAuthStore()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [isSignup, setIsSignup] =
    useState(false)

  async function handleAuth() {
    try {
      if (isSignup) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }

      setUserEmail(email)

      navigate('/')
    } catch (error) {
      console.error(error)

      alert('Authentication failed')
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-950 p-6'>
      <div className='w-full max-w-md rounded-2xl bg-zinc-900 p-8 text-white shadow-2xl'>
        <h1 className='mb-2 text-3xl font-bold'>
          {isSignup
            ? 'Create account'
            : 'Welcome back'}
        </h1>

        <p className='mb-6 text-zinc-400'>
          Access your AI workspace
        </p>

        <div className='space-y-4'>
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className='w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none'
          />

          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className='w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none'
          />

          <button
            onClick={handleAuth}
            className='w-full rounded-lg bg-white px-4 py-3 font-semibold text-black'
          >
            {isSignup
              ? 'Create account'
              : 'Login'}
          </button>
        </div>

        <button
          onClick={() =>
            setIsSignup((prev) => !prev)
          }
          className='mt-6 text-sm text-zinc-400'
        >
          {isSignup
            ? 'Already have an account? Login'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}

export default LoginPage
