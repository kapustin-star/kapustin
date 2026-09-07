import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import AuthScreen from './components/AuthScreen'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Загрузка...</p>
      </main>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-gray-900">Моя CRM</h1>
      <p className="mt-4 text-gray-400 text-lg">Здесь будет доска сделок</p>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 border border-gray-300 text-gray-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100"
      >
        Выйти
      </button>
    </main>
  )
}
