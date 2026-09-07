import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NewDealInput } from '../lib/deals'

interface NewDealFormProps {
  onSubmit: (input: NewDealInput) => Promise<void>
  onClose: () => void
}

const emptyForm = {
  client: '',
  company: '',
  contact: '',
  amount: '',
  note: '',
}

export default function NewDealForm({ onSubmit, onClose }: NewDealFormProps) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const amount = form.amount === '' ? null : Number(form.amount)

    try {
      await onSubmit({
        client: form.client.trim(),
        company: form.company.trim(),
        contact: form.contact.trim(),
        amount: Number.isFinite(amount) ? amount : null,
        note: form.note.trim(),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить сделку')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Новая сделка
        </h2>

        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="text-sm text-gray-600">Клиент *</span>
            <input
              required
              value={form.client}
              onChange={(e) => update('client', e.target.value)}
              placeholder="Имя клиента"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Компания</span>
            <input
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
              placeholder="Название компании"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Контакт</span>
            <input
              value={form.contact}
              onChange={(e) => update('contact', e.target.value)}
              placeholder="Телефон или email"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Сумма</span>
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              placeholder="Сумма сделки"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Заметка</span>
            <textarea
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
              placeholder="Дополнительная информация"
              rows={3}
              className={inputClass}
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Сохраняю...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}
