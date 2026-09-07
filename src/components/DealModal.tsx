import { useState } from 'react'
import type { FormEvent } from 'react'
import { DEAL_STAGES, type Deal, type DealStage } from '../types'
import type { UpdateDealInput } from '../lib/deals'

interface DealModalProps {
  deal: Deal
  onSave: (input: UpdateDealInput) => Promise<void>
  onDelete: () => Promise<void>
  onClose: () => void
}

export default function DealModal({
  deal,
  onSave,
  onDelete,
  onClose,
}: DealModalProps) {
  const [form, setForm] = useState(() => ({
    client: deal.client,
    company: deal.company ?? '',
    contact: deal.contact ?? '',
    amount: deal.amount === null ? '' : String(deal.amount),
    note: deal.note ?? '',
    stage: deal.stage,
  }))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const amount = form.amount === '' ? null : Number(form.amount)

    try {
      await onSave({
        client: form.client.trim(),
        company: form.company.trim(),
        contact: form.contact.trim(),
        amount: Number.isFinite(amount) ? amount : null,
        note: form.note.trim(),
        stage: form.stage,
      })
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось сохранить изменения',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Удалить эту сделку?')) return
    setError('')
    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить сделку')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Детали сделки</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="text-sm text-gray-600">Клиент *</span>
            <input
              required
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Компания</span>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Контакт</span>
            <input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Сумма</span>
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Заметка</span>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Этап</span>
            <select
              value={form.stage}
              onChange={(e) =>
                setForm({ ...form, stage: e.target.value as DealStage })
              }
              className={inputClass}
            >
              {DEAL_STAGES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? 'Удаляю...' : 'Удалить'}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? 'Сохраняю...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
