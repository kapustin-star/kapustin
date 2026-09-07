import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { createDeal, deleteDeal, fetchDeals, updateDeal, updateDealStage } from './lib/deals'
import type { NewDealInput, UpdateDealInput } from './lib/deals'
import type { Deal, DealStage } from './types'
import AuthScreen from './components/AuthScreen'
import KanbanBoard from './components/KanbanBoard'
import NewDealForm from './components/NewDealForm'
import DealModal from './components/DealModal'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState<Deal[]>([])
  const [dealsLoading, setDealsLoading] = useState(true)
  const [dealsError, setDealsError] = useState('')
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

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

  const loadDeals = useCallback(async () => {
    setDealsLoading(true)
    setDealsError('')
    try {
      const data = await fetchDeals()
      setDeals(data)
    } catch (err) {
      setDealsError(err instanceof Error ? err.message : 'Не удалось загрузить сделки')
    } finally {
      setDealsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      loadDeals()
    }
  }, [session, loadDeals])

  async function handleLogout() {
    await supabase.auth.signOut()
    setDeals([])
  }

  async function handleCreateDeal(input: NewDealInput) {
    const newDeal = await createDeal(input)
    setDeals((prev) => [newDeal, ...prev])
  }

  function onDealWon(deal: Deal) {
    // сюда позже подключим уведомления/интеграции
    console.log('Сделка в статусе "Успех" (won):', deal)
  }

  async function handleMoveDeal(dealId: string, stage: DealStage) {
    const updated = deals.find((d) => d.id === dealId)
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage } : d)),
    )
    await updateDealStage(dealId, stage)

    if (updated && stage === 'success') {
      onDealWon({ ...updated, stage })
    }
  }

  async function handleUpdateDeal(input: UpdateDealInput) {
    if (!selectedDeal) return
    const updated = await updateDeal(selectedDeal.id, input)
    setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    if (updated.stage === 'success') {
      onDealWon(updated)
    }
  }

  async function handleDeleteDeal() {
    if (!selectedDeal) return
    await deleteDeal(selectedDeal.id)
    setDeals((prev) => prev.filter((d) => d.id !== selectedDeal.id))
  }

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

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Моя CRM</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-gray-300 text-gray-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Выйти
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Доска сделок</h2>
          <button
            type="button"
            onClick={() => setShowNewDeal(true)}
            className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700"
          >
            + Новая сделка
          </button>
        </div>

        {dealsLoading ? (
          <p className="text-gray-400">Загрузка сделок...</p>
        ) : dealsError ? (
          <p className="text-red-500">{dealsError}</p>
        ) : deals.length === 0 ? (
          <p className="text-gray-400 text-center py-16">
            Пока нет сделок. Нажмите «+ Новая сделка», чтобы добавить первую.
          </p>
        ) : (
          <KanbanBoard
            deals={deals}
            onMoveDeal={handleMoveDeal}
            onSelect={setSelectedDeal}
          />
        )}
      </div>

      {showNewDeal && (
        <NewDealForm
          onSubmit={handleCreateDeal}
          onClose={() => setShowNewDeal(false)}
        />
      )}

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          onSave={handleUpdateDeal}
          onDelete={handleDeleteDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </main>
  )
}
