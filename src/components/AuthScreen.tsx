import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup'

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (mode === 'signup') {
      setError(
        'Вы зарегистрированы! Проверьте письмо для подтверждения, либо войдите, если подтверждение отключено.',
      )
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Моя CRM</h1>
      <h2 className="text-lg text-gray-400 mb-8">Вход / Регистрация</h2>

      <div className="flex mb-6 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('login')
            setError('')
          }}
          className={`px-6 py-2 rounded-md text-sm font-medium transition ${
            mode === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          Войти
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError('')
          }}
          className={`px-6 py-2 rounded-md text-sm font-medium transition ${
            mode === 'signup' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          Зарегистрироваться
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {loading
            ? 'Подождите...'
            : mode === 'login'
              ? 'Войти'
              : 'Зарегистрироваться'}
        </button>
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
      </form>
    </main>
  )
}
